import { Body, Controller, Get, Post } from '@nestjs/common'

import { AdminRole } from '@/app/role.decorator'

import { WxBizService } from './wxbiz.service'

@Controller('/wxbiz')
export class WxBizController {
  constructor(private readonly wxBizService: WxBizService) {}

  @AdminRole()
  @Get('/mail/address')
  async getAppMailAddress() {
    return this.wxBizService.getAppMailAddress()
  }

  @AdminRole()
  @Post('/mail/address')
  async setAppMailAddress(@Body() body: { newAddress: string }) {
    return this.wxBizService.setAppMailAddress(body.newAddress)
  }
}
