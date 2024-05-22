import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { IAppSession } from './auth.service'

export const IS_PUBLIC_KEY = 'AUTH_PUBLIC'

@Injectable()
export class AuthGuardService extends AuthGuard('nestjs-session') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const session: IAppSession = context.switchToHttp().getRequest().session
    const isLogin = !!session?.currentUser

    if (!isLogin) {
      throw new UnauthorizedException('请登录后再继续')
    }

    return isLogin
  }
}
