import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

import { getExceptionMessage } from './exception-message-map'

/** 全局异常处理与包装 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('系统 HttpExceptionFilter')

  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.error(exception.stack)

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const code = exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR

    const errorMessage = getExceptionMessage(exception)

    const errorResponse: IError = {
      success: false,
      code,
      message: errorMessage,
      data: undefined,
    }

    response.status(200).json(errorResponse)
  }
}
