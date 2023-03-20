import { Injectable } from '@nestjs/common'

import { generateOffworkNoticeImageCOSUrl } from '@/offwork-notice/offworkNoticeV2'
import { fetchOffworkRecord } from '@/offwork-notice/fetchOffworkRecord'
import { generateOtherOffworkNoticeMessage } from '@/offwork-notice/offworkOther'
import { generateOffworkNoticeMessage } from '@/offwork-notice/offworkSuzhou'

import { OffworkNoticeRecordService } from '../offwork-notice-record/offwork-notice-record.service'
import { DingtalkBotService } from '../dingtalk/dingtalk.service'

@Injectable()
export class TasksService {
  constructor(
    private readonly dingtalkBotService: DingtalkBotService,
    private readonly offworkNoticeRecordService: OffworkNoticeRecordService
  ) {}

  async runTaskByName(taskName: string) {
    await this[taskName]()
  }

  private async offwork() {
    const todayOffworkRecord = await this.offworkNoticeRecordService.getTodayRecord()
    if (todayOffworkRecord.isWorkDay) {
      await this.__offwork('FE-Bot', todayOffworkRecord)
    }
  }

  private async offworkTest() {
    const todayOffworkRecord = await this.offworkNoticeRecordService.getTodayRecord()
    await this.__offwork('TestBot', todayOffworkRecord)
  }

  private async __offwork(botName: string, record: IDailyOffworkRecord) {
    const bot = await this.dingtalkBotService.createBotByName(botName)

    const otherOffworkNotice = await generateOtherOffworkNoticeMessage(record)
    await bot.send(otherOffworkNotice)

    const suzhouOffworkNotice = await generateOffworkNoticeMessage(record)
    await bot.send(suzhouOffworkNotice)
  }

  private async offworkNoticeV2() {
    const todayOffworkRecord = await this.offworkNoticeRecordService.getTodayRecord()
    if (todayOffworkRecord.isWorkDay) {
      await this.__offworkNoticeV2('FE-Bot', todayOffworkRecord)
    }
  }

  private async offworkNoticeV2Test() {
    const todayOffworkRecord = await this.offworkNoticeRecordService.getTodayRecord()
    await this.__offworkNoticeV2('TestBot', todayOffworkRecord)
  }

  private async __offworkNoticeV2(botName: string, record: IDailyOffworkRecord) {
    const bot = await this.dingtalkBotService.createBotByName(botName)

    const otherOffworkNotice = await generateOtherOffworkNoticeMessage(record)
    await bot.send(otherOffworkNotice)

    const cosFileUrl = await generateOffworkNoticeImageCOSUrl(record)
    await bot.markdown('下班了', `![](${cosFileUrl})`, { atMobiles: [], isAtAll: true })
  }

  private async saveTodayOffworkRecord() {
    const offworkRecord = await fetchOffworkRecord()
    await this.offworkNoticeRecordService.addTodayRecord(offworkRecord)
  }
}
