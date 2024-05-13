import { Global, Module } from '@nestjs/common'

import { DockerStatusController } from './docker-status.controller'
import { DockerStatusService } from './docker-status.service'

@Global()
@Module({
  providers: [DockerStatusService],
  controllers: [DockerStatusController],
})
export class DockerStatusModule {}
