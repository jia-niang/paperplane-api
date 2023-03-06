import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { Model } from 'mongoose'

import { OffworkRecordInject } from '@/schemas/offwork-record.schema'
import { drawOffworkNotice } from '@/offwork-notice/offworkNoticeV2'
import { fetchOffworkRecord } from '@/offwork-notice/fetchOffworkRecord'
import { sendOtherOffworkNotice } from '@/offwork-notice/offworkOther'
import { sendOffworkNotice } from '@/offwork-notice/offworkSuzhou'

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
    await this.__offwork('FE-Bot')
  }

  private async offworkTest() {
    await this.__offwork('TestBot')
  }

  private async __offwork(botName: string) {
    const date = dayjs().format('YYYY-MM-DD')
    const todayOffworkRecord = await this.offworkRecordModel.findOne({ date })
    const bot = await this.dingtalkBotService.createBotByName(botName)
    await sendOtherOffworkNotice(bot, todayOffworkRecord)
    await sendOffworkNotice(bot, todayOffworkRecord)
  }

  private async offworkNoticeV2() {
    await this.__offworkNoticeV2('FE-Bot')
  }

  private async offworkNoticeV2Test() {
    await this.__offworkNoticeV2('TestBot')
  }

  private async __offworkNoticeV2(botName: string) {
    const date = dayjs().format('YYYY-MM-DD')
    const bot = await this.dingtalkBotService.createBotByName(botName)
    const todayOffworkRecord = await this.offworkRecordModel.findOne({ date })
    const cosFileInfo = await drawOffworkNotice(todayOffworkRecord)
    await sendOtherOffworkNotice(bot, todayOffworkRecord)
    await bot.markdown('下班了', `![](${cosFileInfo})`, { atMobiles: [], isAtAll: false })
  }

  private async saveTodayOffworkRecord() {
    const date = dayjs().format('YYYY-MM-DD')
    await this.offworkRecordModel.deleteMany({ date })

    const offworkRecord = await fetchOffworkRecord()
    const offworkDO = new this.offworkRecordModel(offworkRecord)
    await offworkDO.save()
  }
}
