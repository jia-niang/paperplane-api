import { Injectable } from '@nestjs/common'

import { TaskOffworkNoticeService } from './task-offwork-notice.service'

@Injectable()
export class TasksService extends TaskOffworkNoticeService {
  async runTaskByName(taskName: string) {
    await this[taskName]()
  }
}
