import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { MongooseModule } from '@nestjs/mongoose'

import { ResponseInterceptorProvider } from './application/response.interceptor'
import { DingtalkBotModule } from './schemas/dingtalk-bot.schema'
import { DingtalkBotService } from './apis/dingtalk/dingtalk.service'
import { DingtalkController } from './apis/dingtalk/dingtalk.controller'
import { DockerStatusService } from './apis/docker-status/docker-status.service'
import { DockerStatusController } from './apis/docker-status/docker-status.controller'
import { TasksService } from './apis/tasks/tasks.service'
import { TasksController } from './apis/tasks/tasks.controller'
import { AiService } from './apis/ai/ai.service'
import { AiController } from './apis/ai/ai.controller'
import { OffworkRecordModule } from './schemas/offwork-record.schema'
import { OffworkNoticeRecordController } from './apis/offwork-notice-record/offwork-notice-record.controller'
import { OffworkNoticeRecordService } from './apis/offwork-notice-record/offwork-notice-record.service'
import { AiGitHelperService } from './apis/ai-git-helper/ai-git-helper.service'
import { AiGitHelperController } from './apis/ai-git-helper/ai-git-helper.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        ...(process.env.NODE_ENV === 'production'
          ? ['.env.production.local', '.env.production']
          : ['.env.development.local', '.env.development']),
        '.env.local',
        '.env',
      ],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, { dbName: process.env.MONGODB_DBNAME }),
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    DingtalkBotModule,
    OffworkRecordModule,
  ],
  controllers: [
    DingtalkController,
    DockerStatusController,
    TasksController,
    AiController,
    OffworkNoticeRecordController,
    AiGitHelperController,
  ],
  providers: [
    ResponseInterceptorProvider,
    DockerStatusService,
    DingtalkBotService,
    TasksService,
    AiService,
    OffworkNoticeRecordService,
    AiGitHelperService,
  ],
})
export class AppModule {}
