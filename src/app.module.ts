import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PrismaModule } from 'nestjs-prisma'
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'

import { ResponseInterceptorProvider } from './app/response.interceptor'
import { GitModule } from './schemas/git.schema'
import { AiController } from './services/ai/ai.controller'
import { AiService } from './services/ai/ai.service'
import { DailyOffworkRecordService } from './services/daily-offwork/daily-offwork-record.service'
import { DailyOffworkController } from './services/daily-offwork/daily-offwork.controller'
import { DailyOffworkService } from './services/daily-offwork/daily-offwork.service'
import { DockerStatusController } from './services/docker-status/docker-status.controller'
import { DockerStatusService } from './services/docker-status/docker-status.service'
import { GitHelperController } from './services/git-helper/git-helper.controller'
import { GitHelperService } from './services/git-helper/git-helper.service'
import { MessageRobotController } from './services/message-robot/message-robot.controller'
import { MessageRobotService } from './services/message-robot/message-robot.service'
import { ThirdPartyService } from './services/third-party/third-party.service'

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
    PrismaModule.forRoot({
      prismaServiceOptions: {
        middlewares: [
          createSoftDeleteMiddleware({
            models: {},
            defaultConfig: {
              field: 'deletedAt',
              createValue: deleted => (deleted ? new Date() : null),
            },
          }),
        ],
      },
    }),
    GitModule,
  ],
  controllers: [
    DockerStatusController,
    AiController,
    GitHelperController,
    MessageRobotController,
    DailyOffworkController,
  ],
  providers: [
    ResponseInterceptorProvider,
    ThirdPartyService,
    DockerStatusService,
    AiService,
    GitHelperService,
    MessageRobotService,
    DailyOffworkService,
    DailyOffworkRecordService,
  ],
})
export class AppModule {}
