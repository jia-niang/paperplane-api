import { Global, Module } from '@nestjs/common'

import { GitHelperController } from './git-helper.controller'
import { GitHelperService } from './git-helper.service'

@Global()
@Module({
  providers: [GitHelperService],
  controllers: [GitHelperController],
  exports: [GitHelperService],
})
export class GitHelperModule {}
