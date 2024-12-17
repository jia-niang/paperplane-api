import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'
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
import { DailyOffworkRecorderService } from './services/daily-offwork/daily-offwork-recorder.service'
import { DailyOffworkSchedulerService } from './services/daily-offwork/daily-offwork-scheduler.service'
import { DailyOffworkSenderService } from './services/daily-offwork/daily-offwork-sender.service'
import { DailyOffworkSubscriptionService } from './services/daily-offwork/daily-offwork-subscription.service'
import { DailyOffworkController } from './services/daily-offwork/daily-offwork.controller'
import { DailyOffworkService } from './services/daily-offwork/daily-offwork.service'
import { DockerStatusController } from './services/docker-status/docker-status.controller'
import { DockerStatusService } from './services/docker-status/docker-status.service'
import { GitHelperController } from './services/git-helper/git-helper.controller'
import { GitHelperService } from './services/git-helper/git-helper.service'
import { MessageQueueController } from './services/message-queue/message-queue.controller'
import { MessageQueueService } from './services/message-queue/message-queue.service'
import { MessageRobotController } from './services/message-robot/message-robot.controller'
import { MessageRobotService } from './services/message-robot/message-robot.service'
import { RedisService } from './services/redis/redis.service'
import { S3Controller } from './services/s3/s3.controller'
import { S3Service } from './services/s3/s3.service'
import { ShortsController } from './services/shorts/shorts.controller'
import { ShortsService } from './services/shorts/shorts.service'
import { ThirdPartyService } from './services/third-party/third-party.service'
import { UserController } from './services/user/user.controller'
import { UserService } from './services/user/user.service'
import { WxBizController } from './services/wxbiz/wxbiz.controller'
import { WxBizService } from './services/wxbiz/wxbiz.service'

export const rabbitmqConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: 'paperplane-api-default',
    queueOptions: { durable: true },
    prefetchCount: 1,
    noAck: true,
  },
}

@Module({
  imports: [
    RedisModule.forRoot({ type: 'single', url: process.env.REDIS_URL }),
    PrismaModule.forRoot({
      prismaServiceOptions: { middlewares: [prismaSoftDeleteMiddleware] },
      isGlobal: true,
    }),
    ClientsModule.register([{ name: 'PAPERPLANE_API_MQ', ...rabbitmqConfig }]),
    ServeStaticModule.forRoot({
      rootPath: __dirname + '/res',
      serveRoot: '/res',
      serveStaticOptions: {
        setHeaders(res) {
          res.set('Access-Control-Allow-Origin', '*')
        },
      },
    }),
    ScheduleModule.forRoot(),
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
            unset: 'destroy',
            resave: false,
            saveUninitialized: false,
            cookie: {
              secure: process.env.NODE_ENV === 'production',
              maxAge: maxAgeInSecond * 1000,
              sameSite: 'lax',
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
    MessageQueueController,
    WxBizController,
    S3Controller,
  ],
  providers: [
    providePrismaClientExceptionFilter(),
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuardService },
    { provide: APP_GUARD, useClass: RolesGuardService },
    AuthService,
    RedisService,
    MessageQueueService,
    AiService,
    BusinessService,
    GitHelperService,
    DailyOffworkRecorderService,
    DailyOffworkSchedulerService,
    DailyOffworkSubscriptionService,
    DailyOffworkSenderService,
    DailyOffworkService,
    ThirdPartyService,
    MessageRobotService,
    DockerStatusService,
    UserService,
    ShortsService,
    WxBizService,
    S3Service,
  ],
})
export class AppModule {}
