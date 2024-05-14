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

  @Post('/current')
  async addUserRobot(@UserId() userId: string, @Body() robot: MessageRobot) {
    return this.messageRobotService.addUserRobot(userId, robot)
  }

  @Get('/current')
  async listUserRobots(@UserId() userId: string) {
    return this.messageRobotService.listUserRobots(userId)
  }

  @Get('/current/:id')
  async getUserRobotById(@UserId() userId: string, @Param('id') id: string) {
    return this.messageRobotService.getUserRobotById(userId, id)
  }

  @Put('/current/:id')
  async updateUserRobot(
    @Param('id') id: string,
    @Body() robot: MessageRobot,
    @UserId() userId: string
  ) {
    return this.messageRobotService.updateUserRobot(userId, id, robot)
  }

  @Delete('/current/:id')
  async deleteUserRobot(@UserId() userId: string, @Param('id') id: string) {
    return this.messageRobotService.deleteUserRobot(userId, id)
  }

  @Post('/company/:companyId/robot')
  async addCompanyRobot(@Param('companyId') companyId: string, @Body() robot: MessageRobot) {
    return this.messageRobotService.addCompanyRobot(companyId, robot)
  }

  @Get('/company/:companyId/robot')
  async listCompanyRobots(@Param('companyId') companyId: string) {
    return this.messageRobotService.listCompanyRobots(companyId)
  }

  @Get('/company/:companyId/robot/:id')
  async getCompanyRobotById(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.messageRobotService.getCompanyRobotById(companyId, id)
  }

  @Put('/company/:companyId/robot/:id')
  async updateCompanyRobot(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() robot: MessageRobot
  ) {
    return this.messageRobotService.updateCompanyRobot(companyId, id, robot)
  }

  @Delete('/company/:companyId/robot/:id')
  async deleteCompanyRobot(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.messageRobotService.deleteUserRobot(companyId, id)
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
