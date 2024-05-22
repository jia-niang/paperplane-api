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
  @Post('/today/all/record')
  async completeTodayRecord() {
    await this.dailyOffworkRecordService.completeTodayRecord()
  }

  @Public()
  @Post('/today/all/send')
  async sendTodayAll() {
    return this.dailyOffworkService.sendTodayAll()
  }

  @Public()
  @Post(`/today/company/:companyId/workplace/:workplaceId/record`)
  async todayOffworkNoticeViewRecord(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string
  ) {
    return this.dailyOffworkRecordService.addTodayRecordByCompanyWorkplace(companyId, workplaceId)
  }

  @Public()
  @Get(`/today/company/:companyId/workplace/:workplaceId`)
  async todayOffworkDataByCompanyWorkplace(
    @Param('companyId') companyId,
    @Param('workplaceId') workplaceId
  ) {
    return this.dailyOffworkService.todayOffworkDataByCompanyWorkplace(companyId, workplaceId)
  }

  @Public()
  @Post('/today/company/:companyId/workplace/:workplaceId/robot/:robotId/send')
  async sendTodayByFullLayerId(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Param('robotId') robotId: string
  ) {
    return this.dailyOffworkService.sendTodayByFullLayerId(companyId, workplaceId, robotId)
  }

  @Public()
  @Get('/today/company/:companyId/workplace/:workplaceId/view')
  async todayOffworkNoticeView(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Res() res: Response
  ) {
    return res.render(
      'offwork-view',
      await this.dailyOffworkService.todayViewByCompanyWorkplace(companyId, workplaceId)
    )
  }
}
