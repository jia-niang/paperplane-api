import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '@prisma/client'
import { Session } from 'express-session'
import { pick } from 'lodash'

import { UserService } from '../user/user.service'

export interface IAppSession extends Session {
  currentUser?: ISessionUser
}

export interface ISessionUser extends Pick<User, 'id' | 'role'> {}

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(username: string, password: string) {
    const user = await this.userService.loginCheck(username, password)
    if (!user) {
      throw new UnauthorizedException('用户名或密码不正确，请检查后重试')
    }

    return user
  }

  async current(id: string) {
    return this.userService.getUserById(id)
  }

  async logout() {
    return
  }

  async makeSession(user: User): Promise<ISessionUser> {
    return pick(user, ['id', 'role'])
  }
}
