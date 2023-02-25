import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

import { CommonHttpException } from './common.exception'

@Catch()
/** 全局异常处理与包装 */
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: CommonHttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const code = exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR

    const errorResponse: IError<typeof exception.data> = {
      code,
      message: exception.message,
      data: exception.data,
    }

    response.status(200).json(errorResponse)
  }
}
