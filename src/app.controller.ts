import { Controller, Get } from '@nestjs/common'

import { AppService } from './app.service'
import { CommonHttpException } from './global/common.exception'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  status(): string {
    return this.appService.getStatus()
  }

  @Get('/test-error')
  testError(): never {
    throw new CommonHttpException('Error Test')
  }
}
