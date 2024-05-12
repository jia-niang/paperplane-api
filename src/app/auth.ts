import { SetMetadata, createParamDecorator } from '@nestjs/common'

import { IS_PUBLIC_KEY } from '@/services/auth/jwt-auth-guard.service'

export function Public() {
  return SetMetadata(IS_PUBLIC_KEY, true)
}

export const UserId = createParamDecorator((_data, req) => {
  return req.user?.id
})
