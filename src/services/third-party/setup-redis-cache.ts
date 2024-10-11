import { AxiosRequestConfig } from 'axios'
import { StorageValue, buildStorage } from 'axios-cache-interceptor'
import dayjs from 'dayjs'
import { Redis } from 'ioredis'

export interface IRedisCacheOptions {
  type: 'PX' | 'PXAT' | 'EX' | 'EXAT'
  value: number
}

export interface IRedisCacheAxiosOptions extends AxiosRequestConfig {
  redisCache?: IRedisCacheOptions
}

const AXIOS_REDIS_CACHE_PREFIX = 'axios-cache:'

export function setupRedisCache(redis: Redis) {
  return buildStorage({
    async find(key) {
      return redis
        .get(AXIOS_REDIS_CACHE_PREFIX + key)
        .then(result => result && (JSON.parse(result) as StorageValue))
    },

    async set(key, value, req) {
      const cacheOptions: IRedisCacheOptions = (req as any).redisCache
      if (!cacheOptions) {
        return
      }

      await redis.set(
        AXIOS_REDIS_CACHE_PREFIX + key,
        JSON.stringify(value),
        cacheOptions.type as any,
        cacheOptions.value
      )
    },

    async remove(key) {
      await redis.del(AXIOS_REDIS_CACHE_PREFIX + key)
    },

    clear() {
      // 按理说需要遍历删除键，Redis 很难做这个操作
      // 此动作几乎不会有，况且就算有，也对本项目的业务无影响，此处不处理
    },
  })
}

export function redisCache(
  options: IRedisCacheOptions,
  axiosOptions: AxiosRequestConfig = {}
): IRedisCacheAxiosOptions {
  return { ...axiosOptions, redisCache: options }
}

export function redisCacheToday(options: AxiosRequestConfig = {}): IRedisCacheAxiosOptions {
  return redisCache({ type: 'PXAT', value: dayjs().endOf('day').valueOf() }, options)
}

export function redisCacheMonth(options: AxiosRequestConfig = {}): IRedisCacheAxiosOptions {
  return redisCache({ type: 'PXAT', value: dayjs().endOf('month').valueOf() }, options)
}
