import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ServeStaticModule } from '@nestjs/serve-static'

import { AiController } from './apis/ai/ai.controller'
import { AiService } from './apis/ai/ai.service'
import { DingtalkController } from './apis/dingtalk/dingtalk.controller'
import { DingtalkBotService } from './apis/dingtalk/dingtalk.service'
import { DockerStatusController } from './apis/docker-status/docker-status.controller'
import { DockerStatusService } from './apis/docker-status/docker-status.service'
import { GitHelperController } from './apis/git-helper/git-helper.controller'
import { GitHelperService } from './apis/git-helper/git-helper.service'
import { OffworkNoticeRecordController } from './apis/offwork-notice-record/offwork-notice-record.controller'
import { OffworkNoticeRecordService } from './apis/offwork-notice-record/offwork-notice-record.service'
import { TaskOffworkNoticeService } from './apis/tasks/task-offwork-notice.service'
import { TasksController } from './apis/tasks/tasks.controller'
import { TasksService } from './apis/tasks/tasks.service'
import { ResponseInterceptorProvider } from './application/response.interceptor'
import { DingtalkBotModule } from './schemas/dingtalk-bot.schema'
import { GitModule } from './schemas/git.schema'
import { OffworkRecordModule } from './schemas/offwork-record.schema'

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
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      dbName: process.env.MONGODB_DBNAME,
      pluralize: null,
    }),
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    DingtalkBotModule,
    OffworkRecordModule,
    GitModule,
  ],
  controllers: [
    DingtalkController,
    DockerStatusController,
    TasksController,
    AiController,
    OffworkNoticeRecordController,
    GitHelperController,
  ],
  providers: [
    ResponseInterceptorProvider,
    DockerStatusService,
    DingtalkBotService,
    TasksService,
    AiService,
    OffworkNoticeRecordService,
    TaskOffworkNoticeService,
    GitHelperService,
  ],
})
export class AppModule {}
