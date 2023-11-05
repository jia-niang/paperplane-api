import { Injectable } from '@nestjs/common'
import DingtalkBot from 'dingtalk-robot-sender'
import { Model } from 'mongoose'

import { DingtalkBotDBInject } from '@/schemas/dingtalk-bot.schema'

@Injectable()
export class DingtalkBotService {
  constructor(
    @DingtalkBotDBInject()
    private dingtalkBotModle: Model<ICommonDingtalkBot>
  ) {}

  async listAll() {
    return this.dingtalkBotModle.find().exec()
  }

  async getConfigByName(name: string): Promise<ICommonDingtalkBot> {
    return this.dingtalkBotModle.findOne({ name }).exec()
  }

  createBotByCryptoConfig(config: ICommonDingtalkBot): DingtalkBot {
    const { type, accessToken, secret } = config
    const dingtalkApiUrl = 'https://oapi.dingtalk.com/robot/send'
    const dingtalkInitConfig: any = {}

    if (type === 'crypto') {
      dingtalkInitConfig.baseUrl = dingtalkApiUrl
      dingtalkInitConfig.accessToken = accessToken
      dingtalkInitConfig.secret = secret
    } else {
      dingtalkInitConfig.webhook = `${dingtalkApiUrl}?access_token=${accessToken}`
    }

    return new DingtalkBot(dingtalkInitConfig)
  }

  async createBotByName(name: string): Promise<DingtalkBot> {
    const botConfig = await this.getConfigByName(name)
    return this.createBotByCryptoConfig(botConfig)
  }

  async addBot(body: ICommonDingtalkBot) {
    await this.dingtalkBotModle.create(body)
  }
}
