import { Body, Controller, Get, Post, Session } from '@nestjs/common'
import { User } from '@prisma/client'

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
    const sessionUser = await this.authService.makeSessionUser(userInfo)
    session.currentUser = sessionUser
    await this.authService.registerLoginSession(session.id, sessionUser)

    return user
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
  async logout(@UserInfo() user: ISessionUser, @Session() session: IAppSession) {
    session.currentUser = null
    await this.authService.unregisterLoginSession(session.id, user)
    await this.authService.logout()
  }
}
