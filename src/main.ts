import { NestFactory } from '@nestjs/core'
import { RmqOptions } from '@nestjs/microservices'
import { NestExpressApplication } from '@nestjs/platform-express'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import duration from 'dayjs/plugin/duration'
import { merge } from 'lodash/fp'
import { resolve } from 'path'

import { AppModule, rabbitmqConfig } from './app.module'

dayjs.extend(dayOfYear)
dayjs.extend(duration)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.getHttpAdapter().getInstance().disable('x-powered-by')
  app.getHttpAdapter().getInstance().set('trust proxy', 1)
  app.setViewEngine('ejs')
  app.setBaseViewsDir(resolve(__dirname, './views'))

  /**
   * Nest.js 有 bug，必须令 noAck 作为监听端时为 false，作为客户端时为 true
   * https://github.com/nestjs/nest/issues/12000
   * https://github.com/nestjs/nest/issues/11966
   */
  app.connectMicroservice<RmqOptions>(merge(rabbitmqConfig, { options: { noAck: false } }))
  await app.startAllMicroservices()
  await app.listen(6100)
}

bootstrap()
