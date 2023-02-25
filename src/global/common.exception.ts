import { HttpException, HttpStatus } from '@nestjs/common'

export class CommonHttpException extends HttpException {
  constructor(
    message: string,
    public readonly data: any = undefined,
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super({ message, data }, httpStatus)
  }
}
