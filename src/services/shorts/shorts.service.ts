import { Injectable } from '@nestjs/common'
import { Shorts } from '@prisma/client'
import dayjs from 'dayjs'
import { random, trimStart } from 'lodash'
import { PrismaService } from 'nestjs-prisma'

import { RedisService } from '../redis/redis.service'
import { ICreateShortsBody, IShortsResult } from './shorts.controller'
import { blogUrlHexToKey, internalGenerateShortsKey } from './shortsKey'

const SHORTS_ROUTE_PREFIX = 's'
const SHORTS_REDIS_PREFIX = 'shorts:'

@Injectable()
export class ShortsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async internalGenerateShortUrl(shorts: ICreateShortsBody, specifyKey?: string) {
    let key = specifyKey ? trimStart(specifyKey, '/') : null

    // 如果指定了 Key，那么必须使用此 Key，不能使用则直接报错
    if (specifyKey) {
      const existRecord = await this.queryRecordByKey(key)
      if (existRecord) {
        throw new Error(`此短网址已被使用`)
      }
    } else {
      // 如果有已存在的记录，且过期时间相同，直接复用即可
      const existRecord = await this.prisma.shorts.findFirst({
        where: { url: shorts.url, expiredAt: shorts.expiredAt },
      })
      if (existRecord) {
        return this.formatResult(existRecord.id, existRecord.key)
      }

      // 生成 url，如果已重复，添加偏移量重新生成
      let offset = 0
      while (true) {
        offset += random(0, 16)
        key = internalGenerateShortsKey(shorts.url, offset)

        const isRepeat = await this.queryRecordByKey(key)
        if (!isRepeat) {
          break
        }
      }
    }

    const dbResult = await this.prisma.shorts.create({ data: { ...shorts, key } })
    this.redisRegister(dbResult)
    const result = this.formatResult(dbResult.id, dbResult.key)

    return result
  }

  async queryRecordByKey(key: string): Promise<Shorts | null> {
    key = trimStart(key, '/')

    const cachedRedisRecord = await this.redis.get(SHORTS_REDIS_PREFIX + key)
    if (cachedRedisRecord) {
      return JSON.parse(cachedRedisRecord)
    }

    const dbRecord = await this.prisma.shorts.findFirst({
      where: { key, expiredAt: { gt: new Date() } },
    })

    return dbRecord
  }

  async blogRecordByKey(key: string) {
    const hex = blogUrlHexToKey(key)
    const url = `https://paperplane.cc/p/${hex}`

    return url
  }

  private formatResult(id: string, key: string): IShortsResult {
    key = trimStart(key, '/')

    const path = `/${SHORTS_ROUTE_PREFIX}/${key}`
    const result: IShortsResult = {
      id,
      key,
      path,
      p01ShortUrl: `p01.cc${path}`,
      p01FullUrl: `https://p01.cc${path}`,
      paperplaneShortUrl: `paperplane.cc${path}`,
      paperplaneFullUrl: `https://paperplane.cc${path}`,
    }

    return result
  }

  private async redisRegister(record: Shorts) {
    const redisKey = SHORTS_REDIS_PREFIX + record.key
    const redisValue = JSON.stringify(record)

    if (record.expiredAt) {
      await this.redis.set(redisKey, redisValue, 'PXAT', dayjs(record.expiredAt).valueOf())
    } else {
      await this.redis.set(redisKey, redisValue)
    }
  }
}
