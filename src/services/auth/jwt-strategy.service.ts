import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Role } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { IJwtPayloadUser } from './auth.service'

/** JWT Payload 中存储的用户信息 */
export interface IJwtParsedUser {
  id: string
  role: Role
}

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: IJwtPayloadUser): Promise<IJwtParsedUser> {
    return { id: payload.sub, role: payload.role }
  }
}
