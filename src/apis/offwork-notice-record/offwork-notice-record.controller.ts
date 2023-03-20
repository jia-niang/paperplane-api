import { Controller } from '@nestjs/common'

import { OffworkNoticeRecordService } from './offwork-notice-record.service'

@Controller('/offwork-record')
export class OffworkNoticeRecordController {
  constructor(private readonly offworkNoticeRecordService: OffworkNoticeRecordService) {}
}
