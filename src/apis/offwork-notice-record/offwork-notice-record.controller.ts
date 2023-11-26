import { Controller, Get, Param, Res } from '@nestjs/common'
import dayjs from 'dayjs'
import { Response } from 'express'

import { OffworkNoticeRecordService } from './offwork-notice-record.service'

@Controller('/offwork-record')
export class OffworkNoticeRecordController {
  constructor(private readonly offworkNoticeRecordService: OffworkNoticeRecordService) {}

  @Get('/view/:date?')
  async offworkNoticeView(@Res() res: Response, @Param('date') dateString) {
    const date =
      dateString && dayjs(dateString).isValid() ? dateString : dayjs().format('YYYY-MM-DD')
    const offworkViewRecord = await this.offworkNoticeRecordService.offworkNoticeViewByDate(date)

    return res.render('./offwork-record', offworkViewRecord)
  }
}
