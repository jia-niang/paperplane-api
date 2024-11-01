import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common'
import { OffworkNoticeMailSubscription, OffworkNoticeSetting } from '@prisma/client'
import { Response } from 'express'

import { Public } from '@/app/auth.decorator'
import { AdminRole } from '@/app/role.decorator'

import { DailyOffworkRecordService } from './daily-offwork-record.service'
import { DailyOffworkService } from './daily-offwork.service'
import { RobotManageService } from './robot-manage.service'

@Controller('/daily-offwork')
export class DailyOffworkController {
  constructor(
    private readonly dailyOffworkService: DailyOffworkService,
    private readonly dailyOffworkRecordService: DailyOffworkRecordService,
    private readonly robotManagerService: RobotManageService
  ) {}

  @AdminRole()
  @Post('/today/all/record')
  async completeTodayRecord() {
    await this.dailyOffworkRecordService.completeTodayRecord()
  }

  @AdminRole()
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
  @Get(`/date/:date/company/:companyId/workplace/:workplaceId`)
  async getOffworkDataByCompanyWorkplaceAndDate(
    @Param('date') date,
    @Param('companyId') companyId,
    @Param('workplaceId') workplaceId
  ) {
    return this.dailyOffworkService.getOffworkDataByCompanyWorkplaceAndDate(
      date,
      companyId,
      workplaceId
    )
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
  @Post('/date/:date/company/:companyId/workplace/:workplaceId/robot/:robotId/send')
  async sendByDateAndFullLayerId(
    @Param('date') date,
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Param('robotId') robotId: string
  ) {
    return this.dailyOffworkService.sendByDateAndFullLayerId(date, companyId, workplaceId, robotId)
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

  @Public()
  @Get('/date/:date/company/:companyId/workplace/:workplaceId/view')
  async getOffworkNoticeViewByDate(
    @Param('date') date,
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Res() res: Response
  ) {
    return res.render(
      'offwork-view',
      await this.dailyOffworkService.getViewByCompanyWorkplaceAndDate(date, companyId, workplaceId)
    )
  }

  @Public()
  @Get('/today/traffic/workplace/:workplaceId/view')
  async todayOffworkTrafficView(@Param('workplaceId') workplaceId: string, @Res() res: Response) {
    return res.render(
      'offwork-traffic-view',
      await this.dailyOffworkService.todayTrafficViewByWorkplace(workplaceId)
    )
  }

  @AdminRole()
  @Post('/setting/company/:companyId/workplace/:workplaceId/robot/:robotId')
  async addDailyOffworkNoticeSetting(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Param('robotId') robotId: string
  ) {
    return this.robotManagerService.addOffworkNoticeSetting(companyId, workplaceId, robotId)
  }

  @AdminRole()
  @Get('/setting/company/:companyId/workplace/:workplaceId/robot')
  async listDailyOffworkNoticeSetting(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string
  ) {
    return this.robotManagerService.listOffworkNoticeSetting(companyId, workplaceId)
  }

  @AdminRole()
  @Put('/setting/:settingId')
  async updateDailyOffworkNoticeSetting(
    @Param('settingId') settingId: string,
    @Body() body: Pick<OffworkNoticeSetting, 'disabled'>
  ) {
    return this.robotManagerService.updateOffworkNoticeSetting(settingId, body)
  }

  @AdminRole()
  @Delete('/setting/:settingId')
  async deleteDailyOffworkNoticeSetting(@Param('settingId') settingId: string) {
    return this.robotManagerService.deleteOffworkNoticeSetting(settingId)
  }

  @AdminRole()
  @Post('/setting/:settingId/mail-subscription')
  async addOffworkMailSubscription(
    @Param('settingId') settingId: string,
    @Body() body: OffworkNoticeMailSubscription
  ) {
    return this.robotManagerService.addOffworkMailSubscription(settingId, body)
  }

  @AdminRole()
  @Get('/setting/:settingId/mail-subscription')
  async listOffworkMailSubscription(@Param('settingId') settingId: string) {
    return this.robotManagerService.listOffworkMailSubscription(settingId)
  }

  @AdminRole()
  @Put('/mail-subscription/:subId')
  async updateOffworkMailSubscription(
    @Param('subId') subId: string,
    @Body() body: OffworkNoticeMailSubscription
  ) {
    return this.robotManagerService.updateOffworkMailSubscription(subId, body)
  }

  @AdminRole()
  @Delete('/mail-subscription/:subId')
  async deleteOffworkMailSubscription(@Param('subId') subId: string) {
    return this.robotManagerService.deleteOffworkMailSubscription(subId)
  }
}
