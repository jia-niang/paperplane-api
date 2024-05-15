import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import axiosRetry from 'axios-retry'
import dayjs from 'dayjs'
import Redis from 'ioredis'
import { get, round, split } from 'lodash'

import { redisCache, redisCacheMonth, redisCacheToday, setupRedisCache } from './setup-redis-cache'

/** 下班提醒油价信息 */
export interface IOffworkOilpriceInfo {
  '92h': string
  '95h': string
  '98h': string
  '0h': string
}

/** 下班提醒发薪日信息 */
export interface IOffworkSalaryDayInfo {
  salaryDate: string
  salaryDateText: string
  restDays: number
}

/** 下班提醒股价 */
export interface IOffworkStockInfo {
  today: number
  yesterday: number
  delta?: number
}

@Injectable()
export class ThirdPartyService {
  juheClient: AxiosInstance
  defaultClient: AxiosInstance

  constructor(@InjectRedis() private readonly redis: Redis) {
    const juheClient = axios.create({
      proxy: JSON.parse(process.env.JUHE_CN_PROXY_CONFIG || 'null'),
    })
    axiosRetry(juheClient, { retries: 3, retryDelay: () => 500 })
    setupCache(juheClient, { storage: setupRedisCache(redis) })
    this.juheClient = juheClient

    const defaultClient = axios.create()
    axiosRetry(defaultClient, { retries: 3, retryDelay: () => 500 })
    setupCache(defaultClient, {
      storage: setupRedisCache(redis),
      headerInterpreter: () => 1000 * 3600 * 24 * 365,
    })
    this.defaultClient = defaultClient
  }

  /** 拉取油价 API */
  async fetchOilpriceByCityKey(cityKey: string): Promise<IOffworkOilpriceInfo> {
    const res = await this.juheClient
      .get(
        `http://apis.juhe.cn/gnyj/query?key=${process.env.JUHE_OIL_PRICE_API_KEY}`,
        redisCacheToday()
      )
      .then(response => response.data)

    const result = get(res, 'result', [])
    const cityResult = result.find(t => t.city === cityKey)

    return cityResult
  }

  /** 拉取工作日 API 并计算发薪日 */
  async salaryDayApi(salaryDate: number = -1): Promise<IOffworkSalaryDayInfo> {
    const now = dayjs()
    const currentMonthHoliday = await this.juheClient
      .get(
        `http://v.juhe.cn/calendar/month?key=${
          process.env.JUHE_HOLIDAY_API_KEY
        }&year-month=${now.format('YYYY-M')}`,
        redisCacheMonth()
      )
      .then(response => response.data)
      .then(res => get(res, 'result.data.holiday_array', []))
    const nextMonthHoliday = await this.juheClient
      .get(
        `http://v.juhe.cn/calendar/month?key=${process.env.JUHE_HOLIDAY_API_KEY}&year-month=${now
          .add(1, 'month')
          .format('YYYY-M')}`,
        redisCacheMonth()
      )
      .then(response => response.data)
      .then(res => get(res, 'result.data.holiday_array', []))

    const holidayObj = {}
    ;[...currentMonthHoliday, ...nextMonthHoliday].forEach(item => {
      const list = item.list || []
      list.forEach(info => {
        const k = dayjs(info.date).format('MM-DD')
        const v = { holiday: Number(info.status) === 1 }
        holidayObj[k] = v
      })
    })

    let date = now.endOf('month')

    if (salaryDate >= now.date()) {
      date = date.date(salaryDate)
    } else if (salaryDate < 0) {
      date = now.endOf('month').subtract(1 + salaryDate, 'day')
    } else {
      date = date.add(salaryDate, 'day')
    }

    do {
      const holidayInfo = holidayObj[date.format('MM-DD')]
      const isWork = holidayInfo ? !holidayInfo.holiday : date.day() >= 1 && date.day() <= 5

      if (isWork || date.isSame(now, 'date')) {
        break
      } else {
        date = date.subtract(1, 'day')
      }
    } while (true)

    const restDays = date.diff(now, 'day')

    return {
      salaryDate: date.format('YYYY-MM-DD'),
      salaryDateText: date.format('M月D日'),
      restDays: restDays,
    }
  }

  /** 拉取股价 API */
  async fetchStockByCode(code: string): Promise<IOffworkStockInfo> {
    const res = await this.defaultClient
      .get(`https://hq.sinajs.cn/list=${code}`, {
        headers: { Referer: 'https://finance.sina.com.cn' },
        ...redisCacheToday(),
      })
      .then(response => response.data)
    const dataArray = split(res.match(/"([^"]+)"/)[1] || '', ',')

    return {
      today: round(Number(dataArray[3]), 2),
      yesterday: round(Number(dataArray[2]), 2),
      delta: round(Number(dataArray[3]) - Number(dataArray[2]), 2),
    }
  }

  /** 拉取交通状况 */
  async fetchTrafficByPos(lat: string, lon: string, radius: number = 1000): Promise<string> {
    const res = await this.defaultClient
      .get(
        `https://api.map.baidu.com/traffic/v1/around?ak=${process.env.BAIDU_MAP_KEY}&center=${lat},${lon}&radius=${radius}&coord_type_input=gcj02&coord_type_output=gcj02`
      )
      .then(response => response.data)
    const trafficMsg = get(res, 'description').replace(/,/g, '，')

    return trafficMsg
  }

  /** 拉取天气 API */
  async fetchWeatherByCityCode(cityCode: string): Promise<IWeatherResponse> {
    const res = await this.juheClient
      .get(
        `http://apis.juhe.cn/simpleWeather/query?city=${cityCode}&key=${process.env.JUHE_WEATHER_API_KEY}`,
        redisCache({ type: 'PX', value: 2 * 3600 * 1000 })
      )
      .then(response => response.data)
    const weatherInfo = get(res, 'result')

    const todayWeather = get(weatherInfo, 'realtime')
    todayWeather.temperature = todayWeather.temperature + '℃'
    todayWeather.weather = todayWeather.info

    const tomorrowWeather = get(weatherInfo, 'future[0]')
    tomorrowWeather.temperature = tomorrowWeather.temperature.replace('/', '~')
    tomorrowWeather.wid = get(tomorrowWeather, 'wid.day')

    return { today: todayWeather, tomorrow: tomorrowWeather }
  }

  /** 拉取工作日 */
  async todayIsWorkdayApi(): Promise<boolean> {
    const now = dayjs()
    const dateStr = now.format('YYYY-MM-DD')
    const isWorkday = await this.juheClient
      .get(
        `http://apis.juhe.cn/fapig/calendar/day?key=${process.env.JUHE_WORKDAY_API_KEY}&date=${dateStr}`,
        redisCacheMonth()
      )
      .then(response => response.data.result.statusDesc === '工作日')

    return isWorkday
  }
}

export interface IWeatherResponse {
  today: {
    /** 气温，格式如 `"24"` */
    temperature: string
    /** 湿度 */
    humidity: string
    /** 天气，格式如 `"多云转小雨"` */
    info: string
    /** 天气，格式如 `"多云转小雨"` */
    weather: string
    /** 天气标识 ID */
    wid: string
    /** 风向，格式如 `"西北风"` */
    direct: string
    /** 风力，格式如 `"4级"` */
    power: string
    /** 空气质量，格式如 `"50"` */
    aqi: string
  }
  tomorrow: {
    date: string
    /** 气温，格式如 `9/17℃` */
    temperature: string
    /** 天气，格式如 `"多云转小雨"` */
    weather: string
    /** 天气标识 ID */
    wid: string
    /** 风向，格式如 `"西北风"` */
    direct: string
  }
}
