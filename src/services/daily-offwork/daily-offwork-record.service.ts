import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { uniq } from 'lodash'
import { PrismaService } from 'nestjs-prisma'

import { ThirdPartyService } from '../third-party/third-party.service'

@Injectable()
export class DailyOffworkRecordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly thirdParty: ThirdPartyService
  ) {}

  private readonly logger = new Logger(DailyOffworkRecordService.name)

  /** 根据 offwork 配置表完成今日的记录 */
  async completeTodayRecord() {
    await this.addTodayDailyRecord()

    const allSettings = await this.prisma.offworkNoticeSetting.findMany({
      where: { disabled: false },
    })
    const companyIds = uniq(allSettings.map(t => t.companyId))
    const workplaceIds = uniq(allSettings.map(t => t.workplaceId))

    this.logger.log(
      `今日 Offwork 采集，[${allSettings.length}] 条配置，[${companyIds.length}] 家公司，[${workplaceIds.length}] 个工作地点`
    )
    this.logger.log(`公司记录合计[${companyIds.length}]条：`)
    await Promise.all(companyIds.map(companyId => this.addTodayDailyCompanyRecord(companyId)))
    this.logger.log(`工作地点记录合计[${workplaceIds.length}]条：`)
    await Promise.all(
      workplaceIds.map(workplaceId => this.addTodayDailyWorkplaceRecord(workplaceId))
    )

    this.logger.log(`今日 Offwork 采集完成`)
  }

  /** 添加今日的工作日流水记录 */
  async addTodayDailyRecord() {
    const date = dayjs().format('YYYY-MM-DD')

    const isWorkDay = await this.thirdParty.todayIsWorkdayApi()

    await this.prisma.workdayRecord.deleteMany({ where: { date } })
    const result = await this.prisma.workdayRecord.create({
      data: { date, isWorkDay },
    })

    this.logger.log(`[${date}] 工作日流水记录完成`)

    return result
  }

  /** 根据公司 ID 和工作地点 ID 添加今日的记录 */
  async addTodayRecordByCompanyWorkplace(companyId: string, workplaceId: string) {
    await this.prisma.workplace.findFirstOrThrow({ where: { id: workplaceId, companyId } })

    await this.addTodayDailyCompanyRecord(companyId)
    await this.addTodayDailyWorkplaceRecord(workplaceId)
  }

  /** 根据公司 ID 添加今日公司记录 */
  async addTodayDailyCompanyRecord(companyId: string) {
    const date = dayjs().format('YYYY-MM-DD')
    const dailyRecord = await this.prisma.workdayRecord.findFirstOrThrow({ where: { date } })
    const company = await this.prisma.company.findFirstOrThrow({ where: { id: companyId } })

    const data: Prisma.DailyCompanyRecordUncheckedCreateInput = {
      workdayRecordId: dailyRecord.id,
      companyId: company.id,
    }

    if (company.stockCode) {
      const stockInfo = await this.thirdParty.fetchStockByCode(company.stockCode)
      data.todayStock = stockInfo.today
      data.yesterdayStock = stockInfo.yesterday
      data.delta = stockInfo.delta
    }

    if (company.salaryDate) {
      const salaryDateInfo = await this.thirdParty.salaryDayApi(company.salaryDate)
      data.salaryDate = salaryDateInfo.salaryDate
      data.restDays = salaryDateInfo.restDays
    }

    await this.prisma.dailyCompanyRecord.deleteMany({
      where: { workdayRecordId: dailyRecord.id, companyId: company.id },
    })
    const result = await this.prisma.dailyCompanyRecord.create({ data })

    this.logger.log(`添加公司记录 [${companyId}] 完成`)

    return result
  }

  /** 根据 ID 添加今日的工作地点记录 */
  async addTodayDailyWorkplaceRecord(workplaceId: string) {
    const date = dayjs().format('YYYY-MM-DD')
    const dailyRecord = await this.prisma.workdayRecord.findFirstOrThrow({ where: { date } })
    const workplace = await this.prisma.workplace.findFirstOrThrow({ where: { id: workplaceId } })

    const data: Prisma.DailyWorkplaceRecordUncheckedCreateInput = {
      workdayRecordId: dailyRecord.id,
      workplaceId: workplace.id,
    }

    if (workplace.weatherCode) {
      const weatherInfo = await this.thirdParty.fetchWeatherByCityCode(workplace.weatherCode)
      data.todayWeather = weatherInfo.today.weather
      data.todayTemperature = weatherInfo.today.temperature
      data.todayWid = weatherInfo.today.wid
      data.tomorrowWeather = weatherInfo.tomorrow.weather
      data.tomorrowTemperature = weatherInfo.tomorrow.temperature
      data.tomorrowWid = weatherInfo.tomorrow.wid
    }

    if (workplace.oilpriceCode) {
      const oilpriceInfo = await this.thirdParty.fetchOilpriceByCityKey(workplace.oilpriceCode)
      data.h92 = Number(oilpriceInfo['92h'])
      data.h95 = Number(oilpriceInfo['95h'])
      data.h98 = Number(oilpriceInfo['98h'])
    }

    if (workplace.mapLatitude && workplace.mapLongitude) {
      const trafficInfo = await this.thirdParty.fetchTrafficByPos(
        workplace.mapLatitude,
        workplace.mapLongitude
      )
      data.traffic = trafficInfo
    }

    await this.prisma.dailyWorkplaceRecord.deleteMany({
      where: { workdayRecordId: dailyRecord.id, workplaceId: workplace.id },
    })
    const result = await this.prisma.dailyWorkplaceRecord.create({ data })

    this.logger.log(`添加工作地点记录 [${workplaceId}] 完成`)

    return result
  }
}
