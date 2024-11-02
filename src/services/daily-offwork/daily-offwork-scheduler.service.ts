import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { DailyWorkplaceRecord } from '@prisma/client'
import dayjs from 'dayjs'
import { PrismaService } from 'nestjs-prisma'

import { MessageRobotService } from '../message-robot/message-robot.service'
import { DailyOffworkRecordService } from './daily-offwork-record.service'
import { DailyOffworkService } from './daily-offwork.service'

const TRIGGER_BEFORE_OFFSET = 6 * 60 * 1000
const TRIGGER_INTERVAL = 4 * 60 * 1000

@Injectable()
export class DailyOffworkSchedulerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageRobot: MessageRobotService,
    private readonly recorder: DailyOffworkRecordService,
    private readonly offworkService: DailyOffworkService
  ) {}

  private readonly logger = new Logger(DailyOffworkSchedulerService.name)

  @Interval(TRIGGER_INTERVAL)
  async trigger() {
    return this.complete()
  }

  async complete(options?: { ignoreTime?: boolean }) {
    const { ignoreTime = false } = { ...options }

    const offworkTODEnd =
      dayjs().valueOf() - dayjs().startOf('day').valueOf() - TRIGGER_BEFORE_OFFSET
    const offworkTODStart = offworkTODEnd - TRIGGER_INTERVAL

    const companies = await this.prisma.company.findMany({
      where: ignoreTime
        ? undefined
        : { offworkTimeOfDay: { gte: offworkTODStart, lte: offworkTODEnd } },
      include: { OffworkNoticeSetting: { where: { disabled: false } } },
    })

    if (companies.length <= 0) {
      return
    }

    const workdayRecord = await this.ensureWorkdayRecord()

    this.logger.log(`触发 Offwork 采集，共 [${companies.length}] 家公司`)
    for (const company of companies) {
      const companyRecord = await this.recorder.addTodayDailyCompanyRecord(company.id)

      const workplaceRecordTable: Record<string, DailyWorkplaceRecord> = {}
      for (const setting of company.OffworkNoticeSetting) {
        const workplaceId = setting.workplaceId
        let workplaceRecord = workplaceRecordTable[workplaceId]

        if (!workdayRecord) {
          workplaceRecord = await this.recorder.addTodayDailyWorkplaceRecord(workplaceId)
          workplaceRecordTable[workplaceId] = workplaceRecord
        }

        const imageInfo = await this.offworkService.viewToImage(
          workdayRecord.date,
          company.id,
          workplaceId
        )

        await this.prisma.offworkViewRecord.create({
          data: {
            date: workdayRecord.date,
            imageUrl: imageInfo.url,
            companyId: company.id,
            workplaceId: workplaceId,
          },
        })

        await this.messageRobot.sendImageByRobotId(setting.messageRobotId, imageInfo, {
          atAll: true,
          dingtalkTitle: '下班了',
        })
      }
    }
  }

  private async ensureWorkdayRecord() {
    const date = dayjs().format('YYYY-MM-DD')
    const exist = await this.prisma.workdayRecord.findFirst({ where: { date } })
    if (exist) {
      return exist
    }

    return await this.recorder.addTodayDailyRecord()
  }
}
