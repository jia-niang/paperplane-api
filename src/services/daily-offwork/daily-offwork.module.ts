import { Global, Module } from '@nestjs/common'

import { DailyOffworkRecordService } from './daily-offwork-record.service'
import { DailyOffworkController } from './daily-offwork.controller'
import { DailyOffworkService } from './daily-offwork.service'

@Global()
@Module({
  providers: [DailyOffworkRecordService, DailyOffworkService],
  controllers: [DailyOffworkController],
})
export class DailyOffworkModule {}
