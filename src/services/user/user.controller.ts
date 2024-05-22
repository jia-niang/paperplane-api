import { Body, Controller, Get, Post, Session } from '@nestjs/common'
import { User } from '@prisma/client'

import { Public, UserId } from '@/app/auth.decorator'
import { AdminRole } from '@/app/role.decorator'

import { AuthService, IAppSession } from '../auth/auth.service'
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
    session.currentUser = await this.authService.makeSession(userInfo)
    session.save()

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
  async logout(@Session() session: IAppSession) {
    session.currentUser = null
    session.save()

    return this.authService.logout()
  }
}
