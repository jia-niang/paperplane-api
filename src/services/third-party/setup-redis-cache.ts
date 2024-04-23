import { StorageValue, buildStorage } from 'axios-cache-interceptor'
import dayjs from 'dayjs'
import { Redis } from 'ioredis'
import { noop } from 'lodash'

const AXIOS_REDIS_CACHE_PREFIX = 'axios-cache-'

export function setupRedisCache(redis: Redis) {
  return buildStorage({
    find(key) {
      return redis
        .get(AXIOS_REDIS_CACHE_PREFIX + key)
        .then(result => result && (JSON.parse(result) as StorageValue))
    },

    set(key, value) {
      return redis
        .set(
          AXIOS_REDIS_CACHE_PREFIX + key,
          JSON.stringify(value),
          'PXAT',
          dayjs().endOf('day').valueOf()
        )
        .then(noop)
    },

    remove(key) {
      return redis.del(AXIOS_REDIS_CACHE_PREFIX + key).then(noop)
    },
  })
}
