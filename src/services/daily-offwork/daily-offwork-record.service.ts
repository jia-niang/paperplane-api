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
    this.logger.log(`= 今日记录(completeTodayRecord) 开始`)

    await this.addDailyRecord()

    const allSettings = await this.prisma.offworkNoticeSetting.findMany({
      where: { disabled: false },
    })
    const companyIds = uniq(allSettings.map(t => t.companyId))
    const cityIds = uniq(allSettings.map(t => t.cityId))

    this.logger.log(`完成今日 Offwork 记录： 找到了 ${allSettings.length} 条已开启的设置`)
    this.logger.log(`- 去重后需要检索 ${companyIds.length} 家公司`)
    this.logger.log(`- 去重后需要检索 ${cityIds.length} 个城市`)

    this.logger.log(`下面开始依次完成公司记录、城市记录`)
    this.logger.log(`- 公司记录`)
    await Promise.all(companyIds.map(companyId => this.addDailyCompanyRecord(companyId)))
    this.logger.log(`- 城市记录`)
    await Promise.all(cityIds.map(cityId => this.addDailyCityRecord(cityId)))

    this.logger.log(`= 今日记录(completeTodayRecord) 完成`)
  }

  /** 添加今日的工作日流水记录 */
  async addDailyRecord() {
    const date = dayjs().format('YYYY-MM-DD')

    this.logger.log(` 准备 fetch 工作日 api`)
    const isWorkDay = await this.thirdParty.todayIsWorkdayApi()

    this.logger.log(` 准备完成工作日 DB 记录`)
    await this.prisma.workdayRecord.deleteMany({ where: { date } })
    const result = await this.prisma.workdayRecord.create({
      data: { date, isWorkDay },
    })

    this.logger.log(` 工作日流水记录完成`)

    return result
  }

  /** 根据公司 ID 添加今日的公司记录 */
  async addDailyCompanyRecord(companyId: string) {
    this.logger.log(`= 添加公司记录(addDailyCompanyRecord) 开始： ${companyId}`)

    const date = dayjs().format('YYYY-MM-DD')
    const dailyRecord = await this.prisma.workdayRecord.findFirst({ where: { date } })
    const company = await this.prisma.company.findFirst({ where: { id: companyId } })

    const data: Prisma.DailyCompanyRecordUncheckedCreateInput = {
      workdayRecordId: dailyRecord.id,
      companyId: company.id,
    }

    this.logger.log(` DB 记录完成，下面开始 fetch`)

    this.logger.log(` 股价 API`)
    if (company.stockCode) {
      const stockInfo = await this.thirdParty.fetchStockByCode(company.stockCode)
      data.todayStock = stockInfo.today
      data.yesterdayStock = stockInfo.yesterday
      data.delta = stockInfo.delta
    }

    this.logger.log(` 发薪日 API`)
    if (company.salaryDate) {
      const salaryDateInfo = await this.thirdParty.salaryDayApi(company.salaryDate)
      data.salaryDate = salaryDateInfo.salaryDate
      data.restDays = salaryDateInfo.restDays
    }

    this.logger.log(` fetch 完成，下面完成 DB`)

    await this.prisma.dailyCompanyRecord.deleteMany({
      where: { workdayRecordId: dailyRecord.id, companyId: company.id },
    })
    const result = await this.prisma.dailyCompanyRecord.create({ data })

    this.logger.log(`= 添加公司记录(addDailyCompanyRecord) 完成`)
    this.logger.log(``)

    return result
  }

  /** 根据城市 ID 添加今日的城市记录 */
  async addDailyCityRecord(cityId: string) {
    this.logger.log(`= 添加城市记录(addDailyCityRecord) 开始： ${cityId}`)

    const date = dayjs().format('YYYY-MM-DD')
    const dailyRecord = await this.prisma.workdayRecord.findFirst({ where: { date } })
    const city = await this.prisma.city.findFirst({ where: { id: cityId } })

    const data: Prisma.DailyCityRecordUncheckedCreateInput = {
      workdayRecordId: dailyRecord.id,
      cityId: city.id,
    }

    this.logger.log(` DB 记录完成，下面开始 fetch`)

    this.logger.log(` 天气 API`)
    if (city.weatherCode) {
      const weatherInfo = await this.thirdParty.fetchWeatherByCityCode(city.weatherCode)
      data.todayWeather = weatherInfo.today.weather
      data.todayTemperature = weatherInfo.today.temperature
      data.todayWid = weatherInfo.today.wid
      data.tomorrowWeather = weatherInfo.tomorrow.weather
      data.tomorrowTemperature = weatherInfo.tomorrow.temperature
      data.tomorrowWid = weatherInfo.tomorrow.wid
    }

    this.logger.log(` 油价 API`)
    if (city.oilpriceCode) {
      const oilpriceInfo = await this.thirdParty.fetchOilpriceByCityKey(city.oilpriceCode)
      data.h92 = Number(oilpriceInfo['92h'])
      data.h95 = Number(oilpriceInfo['95h'])
      data.h98 = Number(oilpriceInfo['98h'])
    }

    this.logger.log(` 拥堵 API`)
    if (city.mapLatitude && city.mapLongitude) {
      const trafficInfo = await this.thirdParty.fetchTrafficByPos(
        city.mapLatitude,
        city.mapLongitude
      )
      data.traffic = trafficInfo
    }

    this.logger.log(` fetch 完成，下面完成 DB`)

    await this.prisma.dailyCityRecord.deleteMany({
      where: { workdayRecordId: dailyRecord.id, cityId: city.id },
    })
    const result = await this.prisma.dailyCityRecord.create({ data })

    this.logger.log(`= 添加城市记录(addDailyCityRecord) 完成`)
    this.logger.log(``)

    return result
  }
}
