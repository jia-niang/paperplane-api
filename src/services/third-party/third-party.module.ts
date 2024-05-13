import { Global, Module } from '@nestjs/common'

import { ThirdPartyService } from './third-party.service'

@Global()
@Module({
  providers: [ThirdPartyService],
  controllers: [],
  exports: [ThirdPartyService],
})
export class ThirdPartyModule {}
