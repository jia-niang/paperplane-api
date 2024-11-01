import { HttpException, Injectable } from '@nestjs/common'
import { Role, User } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { bcryptCompare, bcryptHash } from '@/utils/bcrypt'

import { isPrecofigAdmin } from '../auth/preconfig-admin'

const userSelector = {
  id: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async addUser(user: User) {
    const hasSameName = await this.prisma.user.findFirst({ where: { name: user.name } })
    if (hasSameName) {
      throw new HttpException('用户名已存在', 409)
    }

    const password = await bcryptHash(user.password)
    const newUser = { name: user.name, password, role: Role.USER }

    return this.prisma.user.create({ data: newUser, select: userSelector })
  }

  async getUserById<T = User>(id: string) {
    return this.prisma.user.findFirstOrThrow({
      where: { id },
      select: userSelector,
    }) as unknown as Promise<T>
  }

  async loginCheck(username: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { name: username } })
    const isOK = await bcryptCompare(password, user?.password || '')

    if (!isOK) {
      return null
    }

    user.password = undefined

    return user
  }

  async ensureStaffRole(userId: string, throwError?: string | Error) {
    if (isPrecofigAdmin(userId)) {
      return true
    }

    const user = await this.prisma.user.findFirst({ where: { id: userId } })
    if (!user) {
      throw new Error('此用户不存在')
    } else if (user.role === Role.ADMIN || user.role === Role.STAFF) {
      return true
    } else if (throwError) {
      throw typeof throwError === 'string' ? new Error(throwError) : throwError
    }

    return false
  }

  async ensureAdminRole(userId: string, throwError?: string | Error) {
    if (isPrecofigAdmin(userId)) {
      return true
    }

    const user = await this.prisma.user.findFirst({ where: { id: userId } })
    if (!user) {
      throw new Error('此用户不存在')
    } else if (user.role === Role.ADMIN) {
      return true
    } else if (throwError) {
      throw typeof throwError === 'string' ? new Error(throwError) : throwError
    }

    return false
  }
}
