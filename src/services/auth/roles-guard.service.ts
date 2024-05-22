import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'

import { IAppSession } from './auth.service'

export const ROLES_KEY = 'ROLES'

@Injectable()
export class RolesGuardService implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const session: IAppSession = context.switchToHttp().getRequest().session
    const role = session?.currentUser?.role
    const isOK = requiredRoles.includes(role)

    if (!isOK) {
      throw new ForbiddenException('权限不足')
    }

    return isOK
  }
}
