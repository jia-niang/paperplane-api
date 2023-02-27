import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ResponseInterceptorProvider } from './application/response.interceptor'
import { DingtalkController } from './apis/dingtalk/dingtalk.controller'
import { DockerStatusController } from './apis/docker-status/docker-status.controller'
import { DockerStatusService } from './apis/docker-status/docker-status.service'
import { DingtalkBotService } from './apis/dingtalk/dingtalk.service'
import { DingtalkBotModule } from './schemas/dingtalk-bot.schema'

const mongodbUrl =
  process.env.NODE_ENV === 'production'
    ? 'mongodb://root:qwer1234@mongo:27017'
    : 'mongodb://root:qwer1234@localhost:27017'

@Module({
  imports: [MongooseModule.forRoot(mongodbUrl, { dbName: 'paperplane' }), DingtalkBotModule],
  controllers: [DingtalkController, DockerStatusController],
  providers: [ResponseInterceptorProvider, DockerStatusService, DingtalkBotService],
})
export class AppModule {}
