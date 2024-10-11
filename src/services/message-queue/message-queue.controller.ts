import { Controller, Post } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'

import { AdminRole } from '@/app/role.decorator'

import { MessageQueueService } from './message-queue.service'

@AdminRole()
@Controller('/mq')
export class MessageQueueController {
  constructor(private readonly mqService: MessageQueueService) {}

  @Post('/test-send')
  testSend() {
    return this.mqService.testSend()
  }

  @MessagePattern('test')
  testListen(@Payload() data: string, @Ctx() context: RmqContext) {
    return this.mqService.testListen(data, context)
  }
}
