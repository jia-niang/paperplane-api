import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import duration from 'dayjs/plugin/duration'
import { resolve } from 'path'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './application/http-exception.filter'

dayjs.extend(dayOfYear)
dayjs.extend(duration)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useGlobalFilters(new HttpExceptionFilter())
  app.setBaseViewsDir(resolve(__dirname, './views'))
  app.setViewEngine('ejs')

  await app.listen(6100)
}

bootstrap()
