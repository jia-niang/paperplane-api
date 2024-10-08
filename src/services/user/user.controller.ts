import { Body, Controller, Get, Post, Res, Session } from '@nestjs/common'
import { User } from '@prisma/client'
import { Response } from 'express'
import { noop } from 'lodash'

import { Public, UserId, UserInfo } from '@/app/auth.decorator'
import { AdminRole } from '@/app/role.decorator'

import { AuthService, IAppSession, ISessionUser } from '../auth/auth.service'
import { UserService } from './user.service'

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Public()
  @Post('/login')
  async login(@Body() user: { name: string; password: string }, @Session() session: IAppSession) {
    const userInfo = await this.authService.login(user.name, user.password)
    const sessionUser = await this.authService.createUserSessionData(userInfo)
    session.currentUser = sessionUser
    session.save(noop)
    await this.authService.registerUserSessions(session.id, sessionUser)

    return userInfo
  }

  @Get('/current')
  async current(@UserId() id: string) {
    return this.authService.current(id)
  }

  @AdminRole()
  @Post('/signup')
  async signUp(@Body() user: User) {
    return this.userService.addUser(user)
  }

  @Post('/logout')
  async logout(
    @UserInfo() user: ISessionUser,
    @Session() session: IAppSession,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.unregisterUserSessions(session.id, user)
    session.destroy(noop)
    await this.authService.logout()
    res.clearCookie(process.env.COOKIES_NAME, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  }
}
