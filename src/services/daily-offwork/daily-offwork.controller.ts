import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common'
import { OffworkNoticeMailSubscription, OffworkNoticeSetting } from '@prisma/client'
import dayjs from 'dayjs'
import { Response } from 'express'

import { Public } from '@/app/auth.decorator'
import { AdminRole } from '@/app/role.decorator'

import { DailyOffworkSubscriptionService } from './daily-offwork-subscription.service'
import { DailyOffworkService } from './daily-offwork.service'

export interface IDailyOffworkQuery {
  nosend?: boolean
}

@Controller('/daily-offwork')
export class DailyOffworkController {
  constructor(
    private readonly offwork: DailyOffworkService,
    private readonly subscription: DailyOffworkSubscriptionService
  ) {}

  /** 手动触发 */
  @AdminRole()
  @Post(`/:mode`)
  async run(@Param('mode') mode) {
    return this.offwork.run({ mode, ignoreWorkday: true })
  }

  /** 手动触发（指定公司） */
  @AdminRole()
  @Post(`/:mode/company/:companyId`)
  async runForCompany(@Param('mode') mode, @Param('companyId') companyId) {
    return this.offwork.run({ mode, specificCompanyId: companyId, ignoreWorkday: true })
  }

  /** 手动触发（指定公司和工作地） */
  @AdminRole()
  @Post(`/:mode/company/:companyId/workplace/:workplaceId`)
  async runForCompanyAndWorkplace(
    @Param('mode') mode,
    @Param('companyId') companyId,
    @Param('workplaceId') workplaceId
  ) {
    return this.offwork.run({
      mode,
      specificCompanyId: companyId,
      specificWorkplaceId: workplaceId,
      ignoreWorkday: true,
    })
  }

  /** 查询记录数据（今天） */
  @Public()
  @Get(`/today/company/:companyId/workplace/:workplaceId`)
  async offworkDataToday(@Param('companyId') companyId, @Param('workplaceId') workplaceId) {
    return this.offwork.offworkData(dayjs().format('YYYY-MM-DD'), companyId, workplaceId)
  }

  /** 查询记录数据 */
  @Public()
  @Get(`/date/:date/company/:companyId/workplace/:workplaceId`)
  async offworkData(
    @Param('date') date,
    @Param('companyId') companyId,
    @Param('workplaceId') workplaceId
  ) {
    return this.offwork.offworkData(date, companyId, workplaceId)
  }

  /** 主视图（今天） */
  @Public()
  @Get('/today/company/:companyId/workplace/:workplaceId/view')
  async todayView(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Res() res: Response
  ) {
    return res.render(
      'offwork-view',
      await this.offwork.offworkViewData(dayjs().format('YYYY-MM-DD'), companyId, workplaceId)
    )
  }

  /** 主视图（按日期） */
  @Public()
  @Get('/date/:date/company/:companyId/workplace/:workplaceId/view')
  async dateView(
    @Param('date') date,
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Res() res: Response
  ) {
    return res.render(
      'offwork-view',
      await this.offwork.offworkViewData(date, companyId, workplaceId)
    )
  }

  /** 主视图（按 ID） */
  @Public()
  @Get('/view/:viewId')
  async idView(@Param('viewId') viewId, @Res() res: Response) {
    return res.render('offwork-view', await this.offwork.offworkViewDataById(viewId))
  }

  /** 交通视图 */
  @Public()
  @Get('/today/traffic/workplace/:workplaceId/view')
  async trafficView(@Param('workplaceId') workplaceId: string, @Res() res: Response) {
    return res.render('offwork-traffic-view', await this.offwork.trafficViewData(workplaceId))
  }

  // 机器人管理

  @AdminRole()
  @Post('/setting/company/:companyId/workplace/:workplaceId')
  async addDailyOffworkNoticeSetting(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string,
    @Body() body: { robotId: string }
  ) {
    return this.subscription.addOffworkNoticeSetting(companyId, workplaceId, body.robotId)
  }

  @AdminRole()
  @Get('/setting/company/:companyId/workplace/:workplaceId')
  async listDailyOffworkNoticeSetting(
    @Param('companyId') companyId: string,
    @Param('workplaceId') workplaceId: string
  ) {
    return this.subscription.listOffworkNoticeSetting(companyId, workplaceId)
  }

  @AdminRole()
  @Put('/setting/:settingId')
  async updateDailyOffworkNoticeSetting(
    @Param('settingId') settingId: string,
    @Body() body: Pick<OffworkNoticeSetting, 'disabled'>
  ) {
    return this.subscription.updateOffworkNoticeSetting(settingId, body)
  }

  @AdminRole()
  @Delete('/setting/:settingId')
  async deleteDailyOffworkNoticeSetting(@Param('settingId') settingId: string) {
    return this.subscription.deleteOffworkNoticeSetting(settingId)
  }

  // 邮件订阅管理

  @AdminRole()
  @Post('/setting/:settingId/mail-subscription')
  async addOffworkMailSubscription(
    @Param('settingId') settingId: string,
    @Body() body: OffworkNoticeMailSubscription
  ) {
    return this.subscription.addOffworkMailSubscription(settingId, body)
  }

  @AdminRole()
  @Get('/setting/:settingId/mail-subscription')
  async listOffworkMailSubscription(@Param('settingId') settingId: string) {
    return this.subscription.listOffworkMailSubscription(settingId)
  }

  @AdminRole()
  @Put('/mail-subscription/:subId')
  async updateOffworkMailSubscription(
    @Param('subId') subId: string,
    @Body() body: OffworkNoticeMailSubscription
  ) {
    return this.subscription.updateOffworkMailSubscription(subId, body)
  }

  @AdminRole()
  @Delete('/mail-subscription/:subId')
  async deleteOffworkMailSubscription(@Param('subId') subId: string) {
    return this.subscription.deleteOffworkMailSubscription(subId)
  }
}
