import { Global, Module } from '@nestjs/common'

import { MessageRobotController } from './message-robot.controller'
import { MessageRobotService } from './message-robot.service'

@Global()
@Module({
  providers: [MessageRobotService],
  controllers: [MessageRobotController],
  exports: [MessageRobotService],
})
export class MessageRobotModule {}
