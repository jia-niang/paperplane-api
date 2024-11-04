import { Injectable, Logger } from '@nestjs/common'
import { Company, Prisma, WorkdayRecord, Workplace } from '@prisma/client'
import crypto from 'crypto'
import dayjs from 'dayjs'
import { noop } from 'lodash'
import { PrismaService } from 'nestjs-prisma'
import puppeteer, { Browser } from 'puppeteer'

import { uploadFile } from '@/utils/s3'

import { IMessageRobotImage } from '../message-robot/message-robot.service'
import { ThirdPartyService } from '../third-party/third-party.service'

@Injectable()
export class DailyOffworkRecorderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly thirdParty: ThirdPartyService
  ) {}

  private readonly logger = new Logger(DailyOffworkRecorderService.name)

  /** 确保已完成工作日记录，没有则记录并返回，有则直接返回 */
  async ensureWorkdayRecord() {
    const date = dayjs().format('YYYY-MM-DD')
    const exist = await this.prisma.workdayRecord.findFirst({ where: { date } })
    if (exist) {
      return exist
    }

    return await this.recordWorkday()
  }

  /** 添加今日的工作日流水记录 */
  async recordWorkday() {
    const date = dayjs().format('YYYY-MM-DD')

    this.logger.log(`[${date}] 工作日流水记录开始`)

    const isWorkDay = await this.thirdParty.todayIsWorkdayApi()
    await this.prisma.workdayRecord.deleteMany({ where: { date } })
    const result = await this.prisma.workdayRecord.create({ data: { date, isWorkDay } })

    this.logger.log(`[${date}] 工作日流水记录完成`)

    return result
  }

  /** 根据公司 ID 添加今日公司记录 */
  async recordCompany(workdayRecord: WorkdayRecord, company: Company) {
    const data: Prisma.DailyCompanyRecordUncheckedCreateInput = {
      workdayRecordId: workdayRecord.id,
      companyId: company.id,
    }

    if (company.stockCode) {
      this.logger.log(` 开始记录公司 [${company.id}] 股价信息`)
      const stockInfo = await this.thirdParty.fetchStockByCode(company.stockCode)
      data.todayStock = stockInfo.today
      data.yesterdayStock = stockInfo.yesterday
      data.delta = stockInfo.delta
    }

    if (company.salaryDate) {
      this.logger.log(` 开始记录公司 [${company.id}] 发薪日`)
      const salaryDateInfo = await this.thirdParty.salaryDayApi(company.salaryDate)
      data.salaryDate = salaryDateInfo.salaryDate
      data.restDays = salaryDateInfo.restDays
    }

    await this.prisma.dailyCompanyRecord.deleteMany({
      where: { workdayRecordId: workdayRecord.id, companyId: company.id },
    })
    const result = await this.prisma.dailyCompanyRecord.create({ data })

    this.logger.log(`添加公司记录 [${company.id}] 完成`)

    return result
  }

  /** 根据 ID 添加今日的工作地点记录 */
  async recordWorkplace(workdayRecord: WorkdayRecord, workplace: Workplace) {
    const data: Prisma.DailyWorkplaceRecordUncheckedCreateInput = {
      workdayRecordId: workdayRecord.id,
      workplaceId: workplace.id,
    }

    if (workplace.weatherCode) {
      this.logger.log(` 开始记录工作地点 [${workplace.id}] 天气信息`)
      const weatherInfo = await this.thirdParty.fetchWeatherByCityCode(workplace.weatherCode)
      data.todayWeather = weatherInfo.today.weather
      data.todayTemperature = weatherInfo.today.temperature
      data.todayWid = weatherInfo.today.wid
      data.tomorrowWeather = weatherInfo.tomorrow.weather
      data.tomorrowTemperature = weatherInfo.tomorrow.temperature
      data.tomorrowWid = weatherInfo.tomorrow.wid
    }

    if (workplace.oilpriceCode) {
      this.logger.log(` 开始记录工作地点 [${workplace.id}] 油价信息`)
      const oilpriceInfo = await this.thirdParty.fetchOilpriceByCityKey(workplace.oilpriceCode)
      data.h92 = Number(oilpriceInfo['92h'])
      data.h95 = Number(oilpriceInfo['95h'])
      data.h98 = Number(oilpriceInfo['98h'])
    }

    if (workplace.mapLatitude && workplace.mapLongitude) {
      this.logger.log(` 开始记录工作地点 [${workplace.id}] 交通信息`)
      const trafficInfo = await this.thirdParty.fetchTrafficByPos(
        workplace.mapLatitude,
        workplace.mapLongitude,
        500
      )
      data.traffic = trafficInfo

      this.logger.log(` 开始记录工作地点 [${workplace.id}] 交通拥堵热力图`)
      const trafficImage = await this.trafficViewImageToUrl(workplace.id)
      data.trafficImage = trafficImage
      data.trafficViewUrl = `${process.env.SERVICE_URL}/daily-offwork/today/traffic/workplace/${workplace.id}/view`
    }

    await this.prisma.dailyWorkplaceRecord.deleteMany({
      where: { workdayRecordId: workdayRecord.id, workplaceId: workplace.id },
    })
    const result = await this.prisma.dailyWorkplaceRecord.create({ data })

    this.logger.log(`添加工作地点记录 [${workplace.id}] 完成`)

    return result
  }

  /** 生成 Offwork 图片 */
  async offworkViewToImage(
    date: string,
    companyId: string,
    workplaceId: string
  ): Promise<IMessageRobotImage> {
    let browser: Browser
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage()
      await page.goto(
        `${process.env.SERVICE_URL}/daily-offwork/date/${date}/company/${companyId}/workplace/${workplaceId}/view`
      )
      await page.setViewport({ width: 1500, height: 800 })
      await page.waitForFunction('window.mapOK === true', { timeout: 5000 }).catch(noop)
      const file = Buffer.from(await page.screenshot({ type: 'jpeg', quality: 100 }))
      await page.close()
      browser.close()

      const nowTimestamp = dayjs().valueOf()
      const url = await uploadFile(
        `/offwork-image/img-${date}-${companyId}-${workplaceId}-${nowTimestamp}.jpg`,
        file
      ).then(fileInfo => fileInfo.fileUrl)

      const base64 = file.toString('base64')

      const hash = crypto.createHash('md5')
      hash.update(file)
      const md5 = hash.digest('hex')

      return { url, base64, md5, file }
    } catch (e) {
      throw e
    } finally {
      browser?.close()
    }
  }

  /** 生成交通图 */
  private async trafficViewImageToUrl(workplaceId: string): Promise<string> {
    let browser: Browser
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage()
      await page.goto(
        `${process.env.SERVICE_URL}/daily-offwork/today/traffic/workplace/${workplaceId}/view`
      )
      await page.setViewport({ width: 650, height: 650 })
      await page.waitForFunction('window.mapOK === true', { timeout: 15000 }).catch(noop)
      const file = Buffer.from(await page.screenshot())
      await page.close()
      browser.close()

      const now = dayjs()
      const url = await uploadFile(
        `/offwork-traffic-image/img-${now.format(
          'YYYY-MM-DD'
        )}-${workplaceId}-${now.valueOf()}.png`,
        file
      ).then(fileInfo => fileInfo.fileUrl)

      return url
    } catch (e) {
      throw e
    } finally {
      browser?.close()
    }
  }
}
