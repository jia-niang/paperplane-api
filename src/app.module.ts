import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { MongooseModule } from '@nestjs/mongoose'

import { ResponseInterceptorProvider } from './application/response.interceptor'
import { DingtalkController } from './apis/dingtalk/dingtalk.controller'
import { DockerStatusController } from './apis/docker-status/docker-status.controller'
import { DockerStatusService } from './apis/docker-status/docker-status.service'
import { DingtalkBotService } from './apis/dingtalk/dingtalk.service'
import { DingtalkBotModule } from './schemas/dingtalk-bot.schema'
import { OffworkRecordModule } from './schemas/offwork-record.schema'
import { TasksController } from './apis/tasks/tasks.controller'
import { TasksService } from './apis/tasks/tasks.service'
import { AiController } from './apis/ai/ai.controller'
import { AiService } from './apis/ai/ai.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development', '.env.production', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, { dbName: 'paperplane' }),
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    DingtalkBotModule,
    OffworkRecordModule,
  ],
  controllers: [DingtalkController, DockerStatusController, TasksController, AiController],
  providers: [
    ResponseInterceptorProvider,
    DockerStatusService,
    DingtalkBotService,
    TasksService,
    AiService,
  ],
})
export class AppModule {}
