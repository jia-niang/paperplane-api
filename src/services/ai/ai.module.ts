import { Global, Module } from '@nestjs/common'

import { AiController } from './ai.controller'
import { AiService } from './ai.service'

@Global()
@Module({
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
