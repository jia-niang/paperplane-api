import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Role, User } from '@prisma/client'
import { JwtPayload } from 'jsonwebtoken'

import { UserService } from '../user/user.service'

export interface IJwtPayloadUser extends JwtPayload {
  sub: string
  role: Role
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.loginCheck(username, password)
    if (!user) {
      throw new UnauthorizedException('用户名或密码不正确，请检查后重试')
    }

    return this.loginSuccessResult(user)
  }

  async refresh(id: string) {
    const user = await this.userService.getUserById(id)
    const result = await this.loginSuccessResult(user)

    return result
  }

  async current(id: string) {
    return this.userService.getUserById(id)
  }

  async logout() {
    return
  }

  private async loginSuccessResult(user: User) {
    const payload: IJwtPayloadUser = {
      sub: user.id,
      role: user.role,
      iss: process.env.NODE_ENV === 'development' ? 'dev' : 'prod',
    }
    const token = this.jwtService.sign(payload)
    const authResult = { user, token }

    return authResult
  }
}
