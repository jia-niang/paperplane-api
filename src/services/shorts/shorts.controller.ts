import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common'
import { Shorts } from '@prisma/client'
import dayjs from 'dayjs'
import type { Response } from 'express'

import { Public } from '@/app/auth.decorator'
import { AdminRole, AnyRole, StaffRole } from '@/app/role.decorator'

import { ShortsService } from './shorts.service'

export interface ICreateShortsBody extends Pick<Shorts, 'url' | 'type' | 'expiredAt'> {}

export interface IShortsResult {
  id: string
  key: string
  path: string
  p01ShortUrl: string
  p01FullUrl: string
  paperplaneShortUrl: string
  paperplaneFullUrl: string
}

@StaffRole()
@Controller('/shorts')
export class ShortsController {
  constructor(private readonly shortsService: ShortsService) {}

  @AdminRole()
  @Post('/')
  async createShorts(@Body() shorts: ICreateShortsBody): Promise<IShortsResult> {
    if (shorts.expiredAt && dayjs(shorts.expiredAt).isBefore(dayjs())) {
      throw new HttpException('过期时间不能早于当前时间', 400)
    }

    if (shorts.type === 'SYSTEM') {
      return this.shortsService.internalGenerateShortUrl(shorts)
    }

    throw new HttpException('无法创建此类型的短网址', 400)
  }

  @Public()
  @AnyRole()
  @Get('/blog/:key')
  async blogRedirect(@Param('key') key: string, @Res() res: Response) {
    console.log('input key:', key)

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
