import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PrismaModule } from 'nestjs-prisma'
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'

import { ResponseInterceptorProvider } from './app/response.interceptor'
import { AiController } from './services/ai/ai.controller'
import { AiService } from './services/ai/ai.service'
import { AuthService } from './services/auth/auth.service'
import { JwtAuthGuard } from './services/auth/jwt-auth-guard.service'
import { JwtStrategy } from './services/auth/jwt.strategy'
import { BusinessController } from './services/business/business.controller'
import { BusinessService } from './services/business/business.service'
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
import { UserController } from './services/user/user.controller'
import { UserService } from './services/user/user.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV === 'production' ? '.env.production.local' : '.env.development.local',
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
        '.env.local',
        '.env',
      ],
      isGlobal: true,
    }),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
      options: { password: process.env.REDIS_PASSWORD },
    }),
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
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60d' },
    }),
  ],
  controllers: [
    DockerStatusController,
    AiController,
    GitHelperController,
    MessageRobotController,
    DailyOffworkController,
    BusinessController,
    UserController,
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
    BusinessService,
    UserService,
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
