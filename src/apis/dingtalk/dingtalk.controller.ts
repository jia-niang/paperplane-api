import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import DingtalkBot from 'dingtalk-robot-sender'

interface ICustomSendBody {
  mode: DingtalkBotTypeAuthType
  accessToken?: string
  secret?: string
  message: any
}

/** 钉钉机器人消息 */
@Controller('/dingtalk')
export class DingtalkController {
  /** 使用任意机器人发送消息 */
  @Post('/send')
  @HttpCode(200)
  async customSend(@Body() body: ICustomSendBody) {
    const { mode, accessToken, secret, message } = body

    const dingtalkApiUrl = 'https://oapi.dingtalk.com/robot/send'
    const dingtalkInitConfig: any = {}

    if (mode === 'crypto') {
      dingtalkInitConfig.baseUrl = dingtalkApiUrl
      dingtalkInitConfig.accessToken = accessToken
      dingtalkInitConfig.secret = secret
    } else {
      dingtalkInitConfig.webhook = `${dingtalkApiUrl}?access_token=${accessToken}`
    }

    const bot = new DingtalkBot(dingtalkInitConfig)
    bot.send(message)
  }
}
