import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService extends Redis {
  constructor(
    @InjectRedis()
    private readonly redisInstance: Redis
  ) {
    super(redisInstance.options)
  }
}
