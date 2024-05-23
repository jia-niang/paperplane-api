import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import RedisStore from 'connect-redis'
import { Redis } from 'ioredis'
import { PrismaModule, providePrismaClientExceptionFilter } from 'nestjs-prisma'
import { NestSessionOptions, SessionModule } from 'nestjs-session'

import { HttpExceptionFilter } from './app/http-exception.filter'
import { prismaSoftDeleteMiddleware } from './app/prisma-soft-delete.middleware'
import { ResponseInterceptor } from './app/response.interceptor'
import { AiController } from './services/ai/ai.controller'
import { AiService } from './services/ai/ai.service'
import { AuthGuardService } from './services/auth/auth-guard.service'
import { AuthService } from './services/auth/auth.service'
import { RolesGuardService } from './services/auth/roles-guard.service'
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
import { RedisService } from './services/redis/redis.service'
import { ShortsController } from './services/shorts/shorts.controller'
import { ShortsService } from './services/shorts/shorts.service'
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
    RedisModule.forRoot({ type: 'single', url: process.env.REDIS_URL }),
    PrismaModule.forRoot({
      prismaServiceOptions: { middlewares: [prismaSoftDeleteMiddleware] },
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    SessionModule.forRootAsync({
      useFactory(): NestSessionOptions {
        const maxAgeInSecond = 180 * 24 * 3600

        return {
          session: {
            name: process.env.COOKIES_NAME,
            secret: process.env.COOKIES_SECRET,
            store: new RedisStore({
              client: new Redis(process.env.REDIS_URL),
              prefix: 'session:',
              ttl: maxAgeInSecond,
            }),
            resave: false,
            saveUninitialized: false,
            cookie: {
              maxAge: maxAgeInSecond * 1000,
            },
          },
          retries: 2,
        }
      },
    }),
  ],
  controllers: [
    AiController,
    BusinessController,
    GitHelperController,
    DailyOffworkController,
    MessageRobotController,
    DockerStatusController,
    UserController,
    ShortsController,
  ],
  providers: [
    providePrismaClientExceptionFilter(),
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuardService },
    { provide: APP_GUARD, useClass: RolesGuardService },
    AuthService,
    RedisService,
    AiService,
    BusinessService,
    GitHelperService,
    DailyOffworkRecordService,
    DailyOffworkService,
    ThirdPartyService,
    MessageRobotService,
    DockerStatusService,
    UserService,
    ShortsService,
  ],
})
export class AppModule {}
