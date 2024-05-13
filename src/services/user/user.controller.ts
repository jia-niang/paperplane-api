import { Body, Controller, Get, Post } from '@nestjs/common'

import { Public, UserId } from '@/app/auth.decorator'

import { AuthService } from '../auth/auth.service'
import { UserService } from './user.service'

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Public()
  @Post('/login')
  async login(@Body() user: { name: string; password: string }) {
    return this.authService.login(user.name, user.password)
  }

  @Get('/current')
  async current(@UserId() id: string) {
    return this.authService.current(id)
  }

  @Post('/signup')
  async signUp(@Body() user) {
    return this.userService.addUser(user)
  }
}
