import { Global, Module } from '@nestjs/common'

import { BusinessController } from './business.controller'
import { BusinessService } from './business.service'

@Global()
@Module({
  providers: [BusinessService],
  controllers: [BusinessController],
})
export class BusinessModule {}
