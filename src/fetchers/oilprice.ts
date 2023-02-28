import { get } from 'lodash'
import axios from 'axios'

const url = 'http://apis.juhe.cn/gnyj/query?key=41d363ec1114fe9fb959adf4d301037f'

export interface ITodayCityOilPriceInfo {
  city: string
  '92h': string
  '95h': string
  '98h': string
  '0h': string
}

export type OilPriceCityType = 'jiangsu' | 'beijing' | 'shanghai'

export interface ITodayOilPriceApiResponse
  extends Record<OilPriceCityType, ITodayCityOilPriceInfo> {}

export async function todayOilPriceApi(): Promise<ITodayOilPriceApiResponse> {
  const res = await axios.get(url).then(response => response.data)
  const result = get(res, 'result', [])

  const jiangsu = result.find(t => t.city === '江苏')
  const beijing = result.find(t => t.city === '北京')
  const shanghai = result.find(t => t.city === '上海')

  return {
    jiangsu,
    beijing,
    shanghai,
  }
}
