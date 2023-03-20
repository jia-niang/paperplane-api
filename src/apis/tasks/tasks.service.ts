import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { Model } from 'mongoose'

import { OffworkRecordInject } from '@/schemas/offwork-record.schema'
import { generateOffworkNoticeImageCOSUrl } from '@/offwork-notice/offworkNoticeV2'
import { fetchOffworkRecord } from '@/offwork-notice/fetchOffworkRecord'
import { generateOtherOffworkNoticeMessage } from '@/offwork-notice/offworkOther'
import { generateOffworkNoticeMessage } from '@/offwork-notice/offworkSuzhou'

import { DingtalkBotService } from '../dingtalk/dingtalk.service'

@Injectable()
export class TasksService {
  constructor(
    private readonly dingtalkBotService: DingtalkBotService,
    @OffworkRecordInject() private readonly offworkRecordModel: Model<IDailyOffworkRecord>
  ) {}

  async runTaskByName(taskName: string) {
    await this[taskName]()
  }

  private async offwork() {
    const todayOffworkRecord = await this.offworkRecordModel.findOne({
      date: dayjs().format('YYYY-MM-DD'),
    })
    if (todayOffworkRecord.isWorkDay) {
      await this.__offwork('FE-Bot', todayOffworkRecord)
    }
  }

  private async offworkTest() {
    const todayOffworkRecord = await this.offworkRecordModel.findOne({
      date: dayjs().format('YYYY-MM-DD'),
    })
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
    const todayOffworkRecord = await this.offworkRecordModel.findOne({
      date: dayjs().format('YYYY-MM-DD'),
    })
    if (todayOffworkRecord.isWorkDay) {
      await this.__offworkNoticeV2('FE-Bot', todayOffworkRecord)
    }
  }

  private async offworkNoticeV2Test() {
    const todayOffworkRecord = await this.offworkRecordModel.findOne({
      date: dayjs().format('YYYY-MM-DD'),
    })
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
    await this.offworkRecordModel.deleteMany({ date: dayjs().format('YYYY-MM-DD') })

    const offworkRecord = await fetchOffworkRecord()
    const offworkDO = new this.offworkRecordModel(offworkRecord)
    await offworkDO.save()
  }
}
