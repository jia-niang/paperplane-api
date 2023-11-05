import { Injectable } from '@nestjs/common'

import { fetchOffworkRecord } from '@/offwork-notice/fetchOffworkRecord'
import { generateOffworkNoticeImageCOSUrl } from '@/offwork-notice/offworkNoticeV2'
import { generateOtherOffworkNoticeMessage } from '@/offwork-notice/offworkOther'
import { generateOffworkNoticeMessage } from '@/offwork-notice/offworkSuzhou'

import { DingtalkBotService } from '../dingtalk/dingtalk.service'
import { OffworkNoticeRecordService } from '../offwork-notice-record/offwork-notice-record.service'

@Injectable()
export class TaskOffworkNoticeService {
  constructor(
    private readonly dingtalkBotService: DingtalkBotService,
    private readonly offworkNoticeRecordService: OffworkNoticeRecordService
  ) {}

  public async offwork() {
    const todayOffworkRecord = await this.offworkNoticeRecordService.getTodayRecord()
    if (todayOffworkRecord.isWorkDay) {
      await this.__offwork('FE-Bot', todayOffworkRecord)
    }
  }

  public async offworkTest() {
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

  public async offworkNoticeV2() {
    const todayOffworkRecord = await this.offworkNoticeRecordService.getTodayRecord()
    if (todayOffworkRecord.isWorkDay) {
      await this.__offworkNoticeV2('FE-Bot', todayOffworkRecord)
    }
  }

  public async offworkNoticeV2Test() {
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

  public async saveTodayOffworkRecord() {
    const offworkRecord = await fetchOffworkRecord()
    await this.offworkNoticeRecordService.addTodayRecord(offworkRecord)
  }
}
