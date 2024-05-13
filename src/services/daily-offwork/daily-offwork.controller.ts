import { Controller, Get, Param, Post, Res } from '@nestjs/common'
import { Response } from 'express'

import { Public } from '@/app/auth.decorator'

import { DailyOffworkRecordService } from './daily-offwork-record.service'
import { DailyOffworkService } from './daily-offwork.service'

@Controller('/daily-offwork')
export class DailyOffworkController {
  constructor(
    private readonly dailyOffworkService: DailyOffworkService,
    private readonly dailyOffworkRecordService: DailyOffworkRecordService
  ) {}

  @Public()
  @Post('/today-record/all')
  async completeTodayRecord() {
    await this.dailyOffworkRecordService.completeTodayRecord()
  }

  @Public()
  @Post('/send/today-all')
  async sendTodayAll() {
    return this.dailyOffworkService.sendTodayAll()
  }

  @Public()
  @Post('/send/company/:companyId/city/:cityId/robot/:robotId')
  async sendByRobot(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string,
    @Param('robotId') robotId: string
  ) {
    return this.dailyOffworkService.sendByRobot(companyId, cityId, robotId)
  }

  @Public()
  @Get('/view/company/:companyId/city/:cityId')
  async offworkNoticeView(
    @Param('companyId') companyId: string,
    @Param('cityId') cityId: string,
    @Res() res: Response
  ) {
    return res.render('offwork-view', await this.dailyOffworkService.view(companyId, cityId))
  }
}
