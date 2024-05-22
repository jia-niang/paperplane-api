import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import { Role, Shorts, ShortsType } from '@prisma/client'
import dayjs from 'dayjs'
import type { Response } from 'express'

import { Public, UserId } from '@/app/auth.decorator'
import { AnyRole, CurrentRole } from '@/app/role.decorator'

import { ShortsService } from './shorts.service'

export interface ICreateShortsBody extends Pick<Shorts, 'url' | 'type' | 'expiredAt' | 'userId'> {
  key?: string
}

export interface IShortsResult {
  id: string
  key: string
  path: string
  p01ShortUrl: string
  p01FullUrl: string
  paperplaneShortUrl: string
  paperplaneFullUrl: string
}

@Controller('/shorts')
export class ShortsController {
  constructor(private readonly shortsService: ShortsService) {}

  @Post('/')
  async createShorts(
    @Body() shorts: ICreateShortsBody,
    @CurrentRole() userRole: Role,
    @UserId() userId: string
  ): Promise<IShortsResult> {
    if (shorts.expiredAt && dayjs(shorts.expiredAt).isBefore(dayjs())) {
      throw new HttpException('过期时间不能早于当前时间', 400)
    } else if (shorts.type === ShortsType.OFFWORK) {
      throw new HttpException('无法创建此类型的短网址', 400)
    } else if (shorts.type === ShortsType.ALIAS && !shorts.key && userRole !== Role.ADMIN) {
      throw new HttpException('此类型的短网址必须指定别名，且必须具有 Admin 权限', 400)
    } else if (shorts.type === ShortsType.SYSTEM && userRole !== Role.ADMIN) {
      throw new HttpException('此类型的短网址必须具有 Admin 权限才能创建', 400)
    }

    if (shorts.type !== ShortsType.SYSTEM) {
      shorts.userId = userId
    }

    return this.shortsService.generateShorts(shorts)
  }

  @Get('/manager')
  async listMyShorts(@Query('type') type: ShortsType, @UserId() userId: string) {
    return this.shortsService.listMyShorts(userId, type || undefined)
  }

  @Delete('/manager/:shortsKey')
  async deleteShorts(@UserId() userId: string, @Param('shortsKey') shortsKey: string) {
    return this.shortsService.deleteShorts(userId, shortsKey)
  }

  @Public()
  @AnyRole()
  @Get('/blog/:key')
  async blogRedirect(@Param('key') key: string, @Res() res: Response) {
    const url = await this.shortsService.blogRecordByKey(key)

    return res.redirect(HttpStatus.MOVED_PERMANENTLY, url)
  }

  @Public()
  @AnyRole()
  @Get('/:key')
  async redirect(@Param('key') key: string, @Res() res: Response) {
    const record = await this.shortsService.queryRecordByKey(key)
    if (!record) {
      throw new HttpException('未找到此短网址', 404)
    }

    if (!record.expiredAt) {
      return res.redirect(HttpStatus.MOVED_PERMANENTLY, record.url)
    } else {
      return res.redirect(HttpStatus.FOUND, record.url)
    }
  }
}
