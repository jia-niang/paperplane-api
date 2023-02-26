import { Module } from '@nestjs/common'

import { ResponseInterceptorProvider } from './application/response.interceptor'
import { DingtalkController } from './apis/dingtalk/dingtalk.controller'
import { DockerStatusController } from './apis/docker-status/docker-status.controller'
import { DockerStatusService } from './apis/docker-status/docker-status.service'

@Module({
  imports: [],
  controllers: [DingtalkController, DockerStatusController],
  providers: [ResponseInterceptorProvider, DockerStatusService],
})
export class AppModule {}
