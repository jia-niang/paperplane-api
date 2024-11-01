import { Role } from '@prisma/client'
import { Request } from 'express'

import { ISessionUser } from './auth.service'

const PRECONFIG_ADMIN_USER_ID = '@passport'

export const preconfigAdminSessionUser: ISessionUser = {
  id: PRECONFIG_ADMIN_USER_ID,
  role: Role.ADMIN,
}

export function checkPreconfigAdmin(request: Request) {
  if (process.env.PRECONFIG_ADMIN_HEADER_NAME && process.env.PRECONFIG_ADMIN_HEADER_VALUE) {
    return (
      request.headers[process.env.PRECONFIG_ADMIN_HEADER_NAME.toLowerCase()] ===
      process.env.PRECONFIG_ADMIN_HEADER_VALUE
    )
  }

  return false
}

export function isPrecofigAdmin(userIdOrSession: ISessionUser | string) {
  return typeof userIdOrSession === 'string'
    ? userIdOrSession === PRECONFIG_ADMIN_USER_ID
    : userIdOrSession.id === PRECONFIG_ADMIN_USER_ID
}
