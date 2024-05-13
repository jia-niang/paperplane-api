import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'

import { IJwtParsedUser } from './jwt-strategy.service'

export const ROLES_KEY = 'ROLES'

@Injectable()
export class RolesGuardService implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    console.log('requiredRoles = ', requiredRoles)

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest<{ user: IJwtParsedUser }>()
    const role = user.role
    const isOK = requiredRoles.includes(role)

    return isOK
  }
}
