import { Injectable, Logger } from '@nestjs/common'
import { DailyWorkplaceRecord } from '@prisma/client'
import dayjs from 'dayjs'
import { omit } from 'lodash'
import { PrismaService } from 'nestjs-prisma'

import { ShortsService } from '../shorts/shorts.service'
import { DailyOffworkRecorderService } from './daily-offwork-recorder.service'
import { DailyOffworkSenderService } from './daily-offwork-sender.service'

const imageCount = 31
const darkThemeImages = [9, 26]

export type DailyOffworkModeType = 'run' | 'record' | 'send'

export interface IDailyOffworkRunOption {
  offworkTimeCondition?: any
  mode?: DailyOffworkModeType
  specificCompanyId?: string
  specificWorkplaceId?: string
  ignoreWorkday?: boolean
}

@Injectable()
export class DailyOffworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shortsService: ShortsService,
    private readonly recorder: DailyOffworkRecorderService,
    private readonly sender: DailyOffworkSenderService
  ) {}

  private readonly logger = new Logger(DailyOffworkService.name)

  /** 主方法，记录和发送 */
  async run(options?: IDailyOffworkRunOption) {
    const { offworkTimeCondition, mode, specificCompanyId, specificWorkplaceId, ignoreWorkday } = {
      mode: 'run' as DailyOffworkModeType,
      ...options,
    }

    const companies = await this.prisma.company.findMany({
      where: { ...offworkTimeCondition, id: specificCompanyId },
      include: {
        allOffworkNoticeSettings: {
          where: { disabled: false, workplaceId: specificWorkplaceId },
          include: { belongToWorkplace: true },
        },
      },
    })

    if (companies.length <= 0) {
      return
    }

    const workdayRecord = await this.recorder.ensureWorkdayRecord()

    if (mode !== 'send') {
      this.logger.log(`触发 Offwork 采集，共 [${companies.length}] 家公司`)

      const workplaceRecordMap: Record<string, DailyWorkplaceRecord> = {}
      const viewRepeatMap: Record<string, boolean> = {}

      for (const company of companies) {
        const companyRecord = await this.recorder.recordCompany(workdayRecord, company)
        for (const setting of company.allOffworkNoticeSettings) {
          let workplaceRecord = workplaceRecordMap[setting.workplaceId]
          if (!workplaceRecord) {
            workplaceRecord = await this.recorder.recordWorkplace(
              workdayRecord,
              setting.belongToWorkplace
            )
            workplaceRecordMap[setting.workplaceId] = workplaceRecord
          } else {
            this.logger.log(` 工作地 [${setting.workplaceId}] 本次已获取过，命中缓存`)
          }

          const isRepeat = viewRepeatMap[`${company.id}-${workplaceRecord.id}`]
          if (!isRepeat) {
            await this.prisma.offworkViewRecord.deleteMany({
              where: {
                date: workdayRecord.date,
                companyId: company.id,
                workplaceId: setting.belongToWorkplace.id,
              },
            })

            const record = await this.prisma.offworkViewRecord.create({
              data: {
                date: workdayRecord.date,
                imageUrl: '',
                viewUrl: '',
                shortUrl: '',
                trafficImageUrl: workplaceRecord.trafficImage,

                companyId: company.id,
                workplaceId: setting.belongToWorkplace.id,

                workdayRecordId: workdayRecord.id,
                dailyCompanyRecordId: companyRecord.id,
                dailyWorkplaceRecordId: workplaceRecord.id,
              },
            })

            const viewUrl = `${process.env.SERVICE_URL}/daily-offwork/view/${record.id}`
            const imageKey = `/offwork-image/${record.id}.png`
            const imageUrl = await this.recorder.offworkViewToImage(viewUrl, imageKey)

            const shortUrl = await this.shortsService.generateDailyOffworkShorts(viewUrl)

            await this.prisma.offworkViewRecord.update({
              where: { id: record.id },
              data: { imageUrl, viewUrl, shortUrl },
            })

            viewRepeatMap[`${company.id}-${workplaceRecord.id}`] = true
          } else {
            this.logger.log(
              ` 公司 [${company.id}] 工作地 [${workplaceRecord.id}] 本次已获取过，命中缓存`
            )
          }
        }
      }

      this.logger.log(`完成 Offwork 采集`)
    }

    if (mode !== 'record') {
      this.logger.log(`触发 Offwork 推送，共 [${companies.length}] 家公司`)

      for (const company of companies) {
        for (const setting of company.allOffworkNoticeSettings) {
          const record = await this.prisma.offworkViewRecord.findFirst({
            where: {
              date: workdayRecord.date,
              companyId: setting.companyId,
              workplaceId: setting.workplaceId,
            },
          })

          if (!record) {
            this.logger.warn(
              `未找到公司 [${company.id}] 工作地 [${setting.workplaceId}] 的 Offwork 记录，已跳过推送消息`
            )

            continue
          } else if (!workdayRecord.isWorkDay && !ignoreWorkday) {
            this.logger.log(`[${workdayRecord.date}] 不是工作日，已跳过推送消息`)

            continue
          }

          await this.sender.offworkSend(setting, record.imageUrl)
        }
      }

      this.logger.log(`完成 Offwork 推送`)
    }
  }

  /** Offwork 的 JSON 数据 */
  async offworkData(date: string, companyId: string, workplaceId: string) {
    const { id, viewUrl, shortUrl, companyRecord, workplaceRecord, company, workplace } =
      await this.prisma.offworkViewRecord.findFirstOrThrow({
        where: { date, companyId, workplaceId },
        include: { companyRecord: true, workplaceRecord: true, company: true, workplace: true },
      })

    return {
      id,
      viewUrl,
      date,
      shortUrl,
      company,
      workplace,
      companyRecord: omit(companyRecord, ['belongToCompany']),
      workplaceRecord: omit(workplaceRecord, ['belongToWorkplace']),
    }
  }

  /** Offwork 的视图数据 */
  async offworkViewData(date: string, companyId: string, workplaceId: string) {
    const { company, workplace, companyRecord, workplaceRecord, shortUrl } = await this.offworkData(
      date,
      companyId,
      workplaceId
    )

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

  /** Offwork 的 ID 视图 */
  async offworkViewDataById(viewId: string) {
    const record = await this.prisma.offworkViewRecord.findFirstOrThrow({ where: { id: viewId } })
    const viewData = await this.offworkViewData(record.date, record.companyId, record.workplaceId)

    return viewData
  }

  /** 提供数据用以渲染交通状况图 */
  async trafficViewData(workplaceId: string) {
    const workplace = await this.prisma.workplace.findFirst({ where: { id: workplaceId } })
    const viewData = {
      ...workplace,
      serviceUrl: process.env.SERVICE_URL,
      baiduMapAK: process.env.BAIDU_MAP_WEBSDK_AK,
    }

    return viewData
  }

  /** 从 id 获取天气图 */
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
