import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

import { IAppSession } from './auth.service'
import { checkPreconfigAdmin } from './preconfig-admin'

export const IS_PUBLIC_KEY = 'AUTH_PUBLIC'

@Injectable()
export class AuthGuardService extends AuthGuard('nestjs-session') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>()
    if (checkPreconfigAdmin(request)) {
      return true
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const session: IAppSession = request.session
    const isLogin = !!session?.currentUser

    if (!isLogin) {
      throw new UnauthorizedException('请登录后再继续')
    }

    return isLogin
  }
}
