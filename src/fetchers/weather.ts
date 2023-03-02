import { get } from 'lodash'
import axios from 'axios'

export interface IWeatherResponse {
  today: {
    /** 气温，格式如 `"24"` */
    temperature: string
    /** 湿度 */
    humidity: string
    /** 天气，格式如 `"多云转小雨"` */
    info: string
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

async function weatherApi(url: string): Promise<IWeatherResponse> {
  const res = await axios.get(url).then(response => response.data)
  const weatherInfo = get(res, 'result')

  const tomorrowWeather = get(weatherInfo, 'future[0]')

  return {
    today: get(weatherInfo, 'realtime'),
    tomorrow: { ...tomorrowWeather, wid: get(tomorrowWeather, 'wid.day') },
  }
}

export async function suzhouWeatherApi() {
  return weatherApi(
    'http://apis.juhe.cn/simpleWeather/query?city=1357&key=a5f26bc48839c1d0bed81796fd6ae664'
  )
}

export async function shanghaiWeatherApi() {
  return weatherApi(
    'http://apis.juhe.cn/simpleWeather/query?city=18&key=a5f26bc48839c1d0bed81796fd6ae664'
  )
}

export async function beijingWeatherApi() {
  return weatherApi(
    'http://apis.juhe.cn/simpleWeather/query?city=3&key=a5f26bc48839c1d0bed81796fd6ae664'
  )
}
