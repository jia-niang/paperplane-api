import { Body, Controller, Get, Post, Param } from '@nestjs/common'

import { CommonDingtalkBot } from '@/schemas/dingtalk-bot.schema'
import { DingtalkBotService } from './dingtalk.service'
interface ICustomSendBody {
  mode: DingtalkBotTypeAuthType
  accessToken?: string
  secret?: string
  message: any
}

/** 钉钉机器人消息 */
@Controller('/dingtalk')
export class DingtalkController {
  constructor(private readonly dingtalkBotService: DingtalkBotService) {}

  /** 添加机器人 */
  @Post('/addBot')
  async addBot(@Body() body: CommonDingtalkBot) {
    this.dingtalkBotService.addBot(body)
  }

  /** 使用任意机器人发送消息 */
  @Post('/send')
  async customSend(@Body() body: ICustomSendBody) {
    const bot = this.dingtalkBotService.createBotByCryptoConfig({ type: body.mode, ...body })
    bot.send(body.message)
  }

  /** 按名称选择机器人并发送消息 */
  @Post('/:botName/send')
  async sendByBotName(@Body() body: any, @Param('botName') botName: string) {
    const botConfig = await this.getBotByName(botName)
    const bot = this.dingtalkBotService.createBotByCryptoConfig(botConfig)
    bot.send(body)
  }

  /** 按名称选择机器人快速发送文本消息 */
  @Post('/:botName/send-text')
  async sendTextByBotName(@Body() body: { text: string }, @Param('botName') botName: string) {
    const messageBody: IDingtalkTextMessage = { msgtype: 'text', text: { content: body.text } }
    this.sendByBotName(messageBody, botName)
  }

  /** 列出所有机器人 */
  @Get('/')
  async listBots() {
    return this.dingtalkBotService.listAll()
  }

  /** 按照名字查找机器人 */
  @Get('/:botName')
  async getBotByName(@Param('botName') botName: string) {
    return this.dingtalkBotService.getConfigByName(botName)
  }
}
