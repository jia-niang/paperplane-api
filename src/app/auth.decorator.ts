import { ExecutionContext, SetMetadata, createParamDecorator } from '@nestjs/common'

import { IS_PUBLIC_KEY } from '@/services/auth/auth-guard.service'
import { IAppSession } from '@/services/auth/auth.service'

/** 标记一个接口为公开，不需登录即可访问 */
export function Public() {
  return SetMetadata(IS_PUBLIC_KEY, true)
}

/** 解除接口的公开状态，需要登录才能访问 */
export function NeedLogin() {
  return SetMetadata(IS_PUBLIC_KEY, false)
}

/** 获取 JWT 中的用户对象 */
export const UserInfo = createParamDecorator((_data, req: ExecutionContext) => {
  const session: IAppSession = req.switchToHttp().getRequest().session

  return session.currentUser
})

/** 获取用户 ID */
export const UserId = createParamDecorator((_data, req: ExecutionContext) => {
  const session: IAppSession = req.switchToHttp().getRequest().session

  return session.currentUser?.id
})
