import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import duration from 'dayjs/plugin/duration'
import { resolve } from 'path'

import { AppModule } from './app.module'

dayjs.extend(dayOfYear)
dayjs.extend(duration)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.getHttpAdapter().getInstance().disable('x-powered-by')

  app.setViewEngine('ejs')
  app.setBaseViewsDir(resolve(__dirname, './views'))

  await app.listen(6100)
}

bootstrap()
