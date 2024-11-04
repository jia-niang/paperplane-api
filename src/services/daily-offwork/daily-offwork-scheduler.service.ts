import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import dayjs from 'dayjs'

import { DailyOffworkService } from './daily-offwork.service'

const TRIGGER_INTERVAL = 3 * 60 * 1000
const TRIGGER_BEFORE_OFFSET = 6 * 60 * 1000

@Injectable()
export class DailyOffworkSchedulerService {
  constructor(private readonly offworkService: DailyOffworkService) {}

  /** 循环触发器 */
  @Interval(TRIGGER_INTERVAL)
  async trigger() {
    const offworkTODEnd =
      dayjs().valueOf() - dayjs().startOf('day').valueOf() + TRIGGER_BEFORE_OFFSET
    const offworkTODStart = offworkTODEnd - TRIGGER_INTERVAL

    const offworkTimeCondition = { offworkTimeOfDay: { gte: offworkTODStart, lte: offworkTODEnd } }

    return this.offworkService.run({ offworkTimeCondition })
  }
}
