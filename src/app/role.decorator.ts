import { ExecutionContext, SetMetadata, createParamDecorator } from '@nestjs/common'
import { Role } from '@prisma/client'

import { ROLES_KEY } from '@/services/auth/roles-guard.service'

/** 指定一组身份，用户需具备此身份才可访问 */
export function Roles(roles: Role[]) {
  return SetMetadata(ROLES_KEY, roles)
}

/** 身份至少为 Admin 才可访问 */
export function AdminRole() {
  return SetMetadata(ROLES_KEY, [Role.ADMIN])
}

/** 身份至少为 Staff 才可访问 */
export function StaffRole() {
  return SetMetadata(ROLES_KEY, [Role.ADMIN, Role.STAFF])
}

/** 身份至少为 User 才可访问 */
export function UserRole() {
  return SetMetadata(ROLES_KEY, [Role.ADMIN, Role.STAFF, Role.USER])
}

/** 获取用户的身份 */
export const CurrentRole = createParamDecorator((_data, req: ExecutionContext) => {
  return req.switchToHttp().getRequest().user?.role as Role
})