import { Module } from '@nestjs/common'

import { ResponseInterceptorProvider } from './global/response.interceptor'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { UserController } from './user/user.controller'
import { UserService } from './user/user.service'

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [ResponseInterceptorProvider, AppService, UserService],
})
export class AppModule {}
