import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/** 响应包装 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        code: context.switchToHttp().getResponse().statusCode,
        message: data.message || '',
        data,
      }))
    )
  }
}

export const ResponseInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useClass: ResponseInterceptor,
}
