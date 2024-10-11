import { Injectable, Logger } from '@nestjs/common'
import crypto from 'crypto'
import dayjs from 'dayjs'
import { noop, omit } from 'lodash'
import { PrismaService } from 'nestjs-prisma'
import puppeteer, { Browser } from 'puppeteer'

import { uploadFile } from '@/utils/s3'

import { IMessageRobotImage, MessageRobotService } from '../message-robot/message-robot.service'
import { ShortsService } from '../shorts/shorts.service'

const imageCount = 31
const darkThemeImages = [9, 26]

@Injectable()
export class DailyOffworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageRobot: MessageRobotService,
    private readonly shortsService: ShortsService
  ) {}

  private readonly logger = new Logger(DailyOffworkService.name)

  async sendTodayAll() {
    const today = dayjs().format('YYYY-MM-DD')

    return this.sendAllByDate(today)
  }

  async sendAllByDate(date: string) {
    const todayRecord = await this.prisma.workdayRecord.findFirst({
      where: { date },
    })

    if (!todayRecord) {
      this.logger.error(`未找到 [${date}] 日记录，发送消息步骤已略去`)
      return
    }

    if (!todayRecord.isWorkDay && process.env.NODE_ENV === 'production') {
      this.logger.log(`[${date}] 不是工作日，跳过消息发送`)
      return
    } else if (!todayRecord.isWorkDay) {
      this.logger.log(`[${date}] 不是工作日，但测试环境仍然发送`)
    }

    const allSetting = await this.prisma.offworkNoticeSetting.findMany({
      where: { disabled: false },
    })

    this.logger.log(`发送 [${date}] 日期的 offwork 消息，共 [${allSetting.length}] 条`)

    for (const item of allSetting) {
      await this.sendByDateAndFullLayerId(
        date,
        item.companyId,
        item.workplaceId,
        item.messageRobotId
      )
    }

    this.logger.log(`日期 [${date}] 的 offwork 消息发送完成`)
  }

  async sendTodayByFullLayerId(companyId: string, workplaceId: string, robotId: string) {
    const today = dayjs().format('YYYY-MM-DD')

    return this.sendByDateAndFullLayerId(today, companyId, workplaceId, robotId)
  }

  async sendByDateAndFullLayerId(
    date: string,
    companyId: string,
    workplaceId: string,
    robotId: string
  ) {
    await this.getViewByCompanyWorkplaceAndDate(date, companyId, workplaceId)
    const image = await this.viewToImage(date, companyId, workplaceId)

    await this.messageRobot.sendImageByRobotId(robotId, image, {
      atAll: true,
      dingtalkTitle: '下班了',
    })
  }

  async viewToImage(
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

  async todayOffworkDataByCompanyWorkplace(companyId: string, workplaceId: string) {
    const today = dayjs().format('YYYY-MM-DD')

    return this.getOffworkDataByCompanyWorkplaceAndDate(today, companyId, workplaceId)
  }

  async getOffworkDataByCompanyWorkplaceAndDate(
    date: string,
    companyId: string,
    workplaceId: string
  ) {
    const workdayRecord = await this.prisma.workdayRecord.findFirst({ where: { date } })

    const companyRecord = await this.prisma.dailyCompanyRecord.findFirst({
      where: { workdayRecordId: workdayRecord.id, companyId },
      include: { belongToCompany: true },
    })
    const company = companyRecord?.belongToCompany

    if (!company) {
      throw new Error(
        `未找到 ID 为 "${companyId}" 的公司记录，请检查提供的 ID 是否正确。如果 ID 无误，请确保 [${date}] 日期生成记录时此公司已存在。`
      )
    }

    const workplaceRecord = await this.prisma.dailyWorkplaceRecord.findFirst({
      where: { workdayRecordId: workdayRecord.id, workplaceId: workplaceId },
      include: { belongToWorkplace: true },
    })
    const workplace = workplaceRecord?.belongToWorkplace

    if (!workplace) {
      throw new Error(
        `未找到 ID 为 "${workplaceId}" 的工作地点记录，请检查提供的 ID 是否正确以及此工作地点是否正确归属于公司 "${company.company}"。` +
          `如果 ID 无误，请确保 [${date}] 日期生成记录时此工作地点已存在。`
      )
    }

    const url = `${process.env.SERVICE_URL}/daily-offwork/date/${date}/company/${companyId}/workplace/${workplaceId}/view`
    const shortUrl = await this.shortsService.generateDailyOffworkShorts(url)

    return {
      url,
      date,
      shortUrl,
      company,
      workplace,
      companyRecord: omit(companyRecord, ['belongToCompany']),
      workplaceRecord: omit(workplaceRecord, ['belongToWorkplace']),
    }
  }

  async todayViewByCompanyWorkplace(companyId: string, workplaceId: string) {
    const today = dayjs().format('YYYY-MM-DD')

    return this.getViewByCompanyWorkplaceAndDate(today, companyId, workplaceId)
  }

  async getViewByCompanyWorkplaceAndDate(date: string, companyId: string, workplaceId: string) {
    const { company, workplace, companyRecord, workplaceRecord, shortUrl } =
      await this.getOffworkDataByCompanyWorkplaceAndDate(date, companyId, workplaceId)

    const now = dayjs(date)
    const bgNumber = 1 + (now.dayOfYear() % imageCount)
    const darkTheme = darkThemeImages.includes(bgNumber)
    const bgUrl = `${process.env.SERVICE_URL}/res/offwork-bg/${bgNumber}.jpg`

    const signText = companyRecord.delta > 0 ? '+' : ''
    const stockText =
      companyRecord.todayStock && companyRecord.delta
        ? `${companyRecord.todayStock} (${signText}${companyRecord.delta})`
        : undefined

    const todayWeatherUrl = this.getWeatherImageUrl(
      workplaceRecord.todayWid,
      workplaceRecord.todayWeather
    )
    const tomorrowWeatherUrl = this.getWeatherImageUrl(
      workplaceRecord.tomorrowWid,
      workplaceRecord.tomorrowWeather
    )

    const viewData = {
      ...workplace,
      ...company,
      ...workplaceRecord,
      ...companyRecord,
      shortUrl,
      date,
      serviceUrl: process.env.SERVICE_URL,
      baiduMapAK: process.env.BAIDU_MAP_WEBSDK_AK,
      bgUrl,
      darkTheme,
      todayWeatherUrl,
      tomorrowWeatherUrl,
      stockText,
    }

    return viewData
  }

  async todayTrafficViewByWorkplace(workplaceId: string) {
    const workplace = await this.prisma.workplace.findFirst({
      where: { id: workplaceId },
    })

    const viewData = {
      ...workplace,
      serviceUrl: process.env.SERVICE_URL,
      baiduMapAK: process.env.BAIDU_MAP_WEBSDK_AK,
    }

    return viewData
  }

  private getWeatherImageUrl(mid: string | number, weatherName?: string) {
    const numbericMid = Number(mid)

    const fileName = (function () {
      // 存在例如“阴转小雨”的情况且 wid 仍为 0~2，此时应优先展示含有“雨”的图标
      if ([0, 1, 2].includes(numbericMid) && weatherName?.includes('雨')) {
        if (weatherName?.includes('小雨')) return 'xiaoyu'
        if (weatherName?.includes('中雨')) return 'zhongyu'
        if (weatherName?.includes('大雨')) return 'dayu'
        return 'xiaoyu'
      }

      if ([0, 1, 2].includes(numbericMid) && weatherName?.includes('雪')) {
        if (weatherName?.includes('小雪')) return 'xiaoxue'
        if (weatherName?.includes('中雪')) return 'zhongxue'
        if (weatherName?.includes('大雪')) return 'daxue'
        return 'xiaoxue'
      }

      if (0 === numbericMid) return 'qing'
      if (1 === numbericMid) return 'duoyun'
      if (2 === numbericMid) return 'yin'
      if (3 === numbericMid) return 'zhenyu'
      if ([4, 5].includes(numbericMid)) return 'leizhenyu'
      if ([6, 19].includes(numbericMid)) return 'xiaoxue'
      if ([7, 21].includes(numbericMid)) return 'xiaoyu'
      if ([8, 9, 22].includes(numbericMid)) return 'zhongyu'
      if ([9, 10, 11, 12, 23, 24, 25].includes(numbericMid)) return 'dayu'
      if ([13, 14, 26].includes(numbericMid)) return 'xiaoxue'
      if ([15, 27].includes(numbericMid)) return 'zhongxue'
      if ([16, 17, 28].includes(numbericMid)) return 'daxue'
      if ([18, 20, 29, 30, 53].includes(numbericMid)) return 'wumai'
      if (31 === numbericMid) return 'taifeng'

      return 'unknown'
    })()

    return `${process.env.SERVICE_URL}/res/weather/${fileName}.png`
  }
}
