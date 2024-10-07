import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '@prisma/client'
import { Session } from 'express-session'
import { pick } from 'lodash'

import { RedisService } from '../redis/redis.service'
import { UserService } from '../user/user.service'

export interface IAppSession extends Session {
  currentUser?: ISessionUser
}

export interface ISessionUser extends Pick<User, 'id' | 'role'> {}

const LOGIN_USERS_PREFIX = 'login-users:'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly redis: RedisService
  ) {}

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

  async makeSessionUser(user: User): Promise<ISessionUser> {
    return pick(user, ['id', 'role'])
  }

  async registerLoginSession(sessionId: string, user: ISessionUser) {
    await this.redis.sadd(LOGIN_USERS_PREFIX + user.id, sessionId)
  }

  async unregisterLoginSession(sessionId: string, user: ISessionUser) {
    await this.redis.srem(LOGIN_USERS_PREFIX + user.id, sessionId)
  }

  async updateLoginSession(userId: string, newUser: ISessionUser) {
    const sessionIds = await this.redis.smembers(LOGIN_USERS_PREFIX + userId)
    await Promise.allSettled(
      sessionIds.map(
        sessionId =>
          new Promise<void>(async resolve => {
            const sessionRecord = await this.redis.get(sessionId)
            if (!sessionRecord) {
              this.redis.srem(LOGIN_USERS_PREFIX + userId, sessionId)
              resolve()
            }

            const session = JSON.parse(sessionRecord) as IAppSession
            session.currentUser = newUser
            await this.redis.set(sessionId, JSON.stringify(session))
            resolve()
          })
      )
    )
  }
}
