import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PrismaModule } from 'nestjs-prisma'

import { prismaSoftDeleteMiddleware } from './app/prisma-soft-delete.middleware'
import { ResponseInterceptorProvider } from './app/response.interceptor'
import { AiModule } from './services/ai/ai.module'
import { AuthModule } from './services/auth/auth.module'
import { BusinessModule } from './services/business/business.module'
import { DailyOffworkModule } from './services/daily-offwork/daily-offwork.module'
import { DockerStatusModule } from './services/docker-status/docker-status.module'
import { GitHelperModule } from './services/git-helper/git-helper.module'
import { MessageRobotModule } from './services/message-robot/message-robot.module'
import { ThirdPartyModule } from './services/third-party/third-party.module'
import { UserModule } from './services/user/user.module'

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
      prismaServiceOptions: { middlewares: [prismaSoftDeleteMiddleware] },
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    ThirdPartyModule,
    AiModule,
    AuthModule,
    BusinessModule,
    DailyOffworkModule,
    DockerStatusModule,
    GitHelperModule,
    MessageRobotModule,
    UserModule,
  ],
  controllers: [],
  providers: [ResponseInterceptorProvider],
})
export class AppModule {}
