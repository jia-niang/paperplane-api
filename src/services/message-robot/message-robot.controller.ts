import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { MessageRobot, MessageRobotType } from '@prisma/client'

import { Public, UserId } from '@/app/auth.decorator'

import { IMessageRobotAuth, MessageRobotService } from './message-robot.service'

export interface ICustomSendBody {
  type: MessageRobotType
  auth: IMessageRobotAuth
  body: object
}

@Controller('/message-robot')
export class MessageRobotController {
  constructor(private readonly messageRobotService: MessageRobotService) {}

  @Post('/')
  async addRobot(@Body() robot: MessageRobot, @UserId() userId: string) {
    return this.messageRobotService.addUserRobot(robot, userId)
  }

  @Get('/')
  async listUserRobots(@UserId() userId: string) {
    return this.messageRobotService.listUserRobots(userId)
  }

  @Get('/:id')
  async getUserRobotById(@Param('id') id: string, @UserId() userId: string) {
    return this.messageRobotService.getUserRobotById(id, userId)
  }

  @Put('/:id')
  async updateUserRobot(
    @Param('id') id: string,
    @Body() robot: MessageRobot,
    @UserId() userId: string
  ) {
    return this.messageRobotService.updateUserRobot(id, robot, userId)
  }

  @Delete('/:id')
  async deleteUserRobot(@Param('id') id: string, @UserId() userId: string) {
    return this.messageRobotService.deleteUserRobot(id, userId)
  }

  @Public()
  @Post('/custom-send')
  async customSend(@Body() formData: ICustomSendBody) {
    const { type, auth, body } = formData
    const result = await this.messageRobotService.sendJSONByFullConfig(
      type.toUpperCase() as MessageRobotType,
      body,
      auth
    )

    return result
  }
}
