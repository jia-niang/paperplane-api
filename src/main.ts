import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import duration from 'dayjs/plugin/duration'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { resolve } from 'path'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './app/http-exception.filter'

dayjs.extend(dayOfYear)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault('Asia/Shanghai')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useGlobalFilters(new HttpExceptionFilter())
  app.setBaseViewsDir(resolve(__dirname, './views'))
  app.setViewEngine('ejs')

  await app.listen(6100)
}

bootstrap()
