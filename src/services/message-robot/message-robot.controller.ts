import { Body, Controller, Post } from '@nestjs/common'
import { MessageRobotType } from '@prisma/client'

import { IMessageRobotAuth, MessageRobotService } from './message-robot.service'

export interface ICustomSendBody {
  type: MessageRobotType
  auth: IMessageRobotAuth
  body: object
}

@Controller('/message-robot')
export class MessageRobotController {
  constructor(private readonly messageRobotService: MessageRobotService) {}

  @Post('/custom-send')
  async customSend(@Body() formData: ICustomSendBody) {
    const { type, auth, body } = formData
    const result = await this.messageRobotService.sendByFullConfig(
      type.toUpperCase() as MessageRobotType,
      body,
      auth
    )

    return result
  }
}
