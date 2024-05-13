import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'

import { UserService } from '../user/user.service'

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

    const token = await this.signAccessToken(user)
    const authResult = { user, token }

    return authResult
  }

  async current(id: string) {
    return this.userService.getUserById(id)
  }

  private async signAccessToken(user: User) {
    const payload = {
      sub: user.id,
      iss: process.env.NODE_ENV === 'development' ? 'local' : 'paperplane-api',
    }
    const result = this.jwtService.sign(payload)

    return result
  }
}
