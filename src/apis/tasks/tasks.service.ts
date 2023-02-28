import { Injectable } from '@nestjs/common'

import { DingtalkBotService } from '../dingtalk/dingtalk.service'
import { sendOtherOffworkNotice } from './offworkOther'
import { sendOffworkNotice } from './offworkSuzhou'

@Injectable()
export class TasksService {
  constructor(private readonly dingtalkBotService: DingtalkBotService) {}

  async runTaskByName(taskName: string) {
    await this[taskName]()
  }

  private async offwork() {
    const bot = await this.dingtalkBotService.createBotByName('FE-Bot')
    await sendOtherOffworkNotice(bot)
    await sendOffworkNotice(bot)
  }

  private async offworkTest() {
    const bot = await this.dingtalkBotService.createBotByName('TestBot')
    await sendOtherOffworkNotice(bot)
    await sendOffworkNotice(bot)
  }
}
