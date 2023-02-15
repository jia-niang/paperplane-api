import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getStatus(): string {
    return `Running, now is ${new Date().toTimeString()}.`
  }
}
