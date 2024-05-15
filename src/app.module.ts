import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PrismaModule, providePrismaClientExceptionFilter } from 'nestjs-prisma'

import { HttpExceptionFilter } from './app/http-exception.filter'
import { prismaSoftDeleteMiddleware } from './app/prisma-soft-delete.middleware'
import { ResponseInterceptorProvider } from './app/response.interceptor'
import { AiController } from './services/ai/ai.controller'
import { AiService } from './services/ai/ai.service'
import { AuthService } from './services/auth/auth.service'
import { JwtAuthGuardService } from './services/auth/jwt-auth-guard.service'
import { JwtStrategyService } from './services/auth/jwt-strategy.service'
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
      prismaServiceOptions: { middlewares: [prismaSoftDeleteMiddleware] },
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({ rootPath: __dirname + '/res', serveRoot: '/res' }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60d' },
      verifyOptions: {
        issuer: process.env.NODE_ENV === 'development' ? 'paperplane-api-local' : 'paperplane-api',
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
  ],
  providers: [
    ResponseInterceptorProvider,
    providePrismaClientExceptionFilter(),
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    AiService,
    BusinessService,
    GitHelperService,
    DailyOffworkRecordService,
    DailyOffworkService,
    ThirdPartyService,
    MessageRobotService,
    DockerStatusService,
    UserService,
    AuthService,
    JwtStrategyService,
    { provide: APP_GUARD, useClass: JwtAuthGuardService },
    { provide: APP_GUARD, useClass: RolesGuardService },
  ],
})
export class AppModule {}
