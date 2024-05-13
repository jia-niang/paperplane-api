import { Global, Module } from '@nestjs/common'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Global()
@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
