import { HttpException } from '@nestjs/common'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library'

export function getExceptionMessage(exception: HttpException): string {
  if (exception instanceof PrismaClientValidationError) {
    return '数据验证失败，请检查输入数据和格式并重试。'
  } else if (exception instanceof PrismaClientKnownRequestError) {
    return '数据操作失败，请检查输入数据和格式并重试。'
  }

  return '数据有误，请检查输入并重试。'
}
