import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

import { CommonHttpException } from './common.exception'

/** 全局异常处理与包装 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('系统 HttpExceptionFilter')

  catch(exception: CommonHttpException, host: ArgumentsHost) {
    this.logger.error(exception, exception.cause)

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const code = exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR

    const errorResponse: IError<typeof exception.data> = {
      success: false,
      code,
      message: exception.message,
      data: exception.data,
    }

    response.status(200).json(errorResponse)
  }
}
