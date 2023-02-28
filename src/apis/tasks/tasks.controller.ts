import { Controller, HttpCode, Param, Post } from '@nestjs/common'

import { TasksService } from './tasks.service'

@Controller('/task')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post('/:taskName/run')
  @HttpCode(200)
  async runTaskByName(@Param('taskName') taskName: string) {
    await this.taskService.runTaskByName(taskName)
  }
}
