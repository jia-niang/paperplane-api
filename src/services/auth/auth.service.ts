import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '@prisma/client'
import dayjs from 'dayjs'
import { Session } from 'express-session'
import { pick } from 'lodash'

import { RedisService } from '../redis/redis.service'
import { UserService } from '../user/user.service'

export interface IAppSession extends Session {
  currentUser?: ISessionUser
}

export interface ISessionUser extends Pick<User, 'id' | 'role'> {}

const USER_SESSIONS_PREFIX = 'user-sessions:'

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

  async createUserSessionData(user: User): Promise<ISessionUser> {
    return pick(user, ['id', 'role'])
  }

  async logoutExceededSessions(userId: string) {
    const maxSessionPerUser = Number(process.env.MAX_SESSION_PER_USER || 1)
    if (maxSessionPerUser <= 0) {
      return
    }

    const exceededSessionIds = await this.redis.zrevrange(
      USER_SESSIONS_PREFIX + userId,
      maxSessionPerUser,
      -1
    )
    if (exceededSessionIds.length > 0) {
      this.redis.zrem(USER_SESSIONS_PREFIX + userId, ...exceededSessionIds)
      exceededSessionIds.forEach(sessionId => {
        this.redis.del('session:' + sessionId)
      })
    }
  }

  async registerUserSessions(sessionId: string, user: ISessionUser) {
    await this.redis.zadd(USER_SESSIONS_PREFIX + user.id, dayjs().valueOf(), sessionId)
    this.logoutExceededSessions(user.id)
  }

  async unregisterUserSessions(sessionId: string, user: ISessionUser) {
    await this.redis.zrem(USER_SESSIONS_PREFIX + user.id, sessionId)
    this.logoutExceededSessions(user.id)
  }

  async updateUserSessions(userId: string, newUser: ISessionUser) {
    const sessionIds = await this.redis.zrevrange(USER_SESSIONS_PREFIX + userId, 0, -1)
    await Promise.allSettled(
      sessionIds.map(
        sessionId =>
          new Promise<void>(async resolve => {
            const sessionRecord = await this.redis.get(sessionId)
            if (!sessionRecord) {
              this.redis.zrem(USER_SESSIONS_PREFIX + userId, sessionId)
              resolve()
            }

            const session = JSON.parse(sessionRecord) as IAppSession
            session.currentUser = newUser
            await this.redis.set('session:' + sessionId, JSON.stringify(session))
            resolve()
          })
      )
    )
  }
}
