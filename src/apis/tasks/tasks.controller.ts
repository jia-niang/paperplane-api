import { Controller, Param, Post } from '@nestjs/common'

import { TasksService } from './tasks.service'

@Controller('/task')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post('/:taskName/run')
  async runTaskByName(@Param('taskName') taskName: string) {
    await this.taskService.runTaskByName(taskName)
  }
}
