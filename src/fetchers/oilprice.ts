import { get } from 'lodash'
import axios from 'axios'

export async function todayOilPriceApi(): Promise<Record<offworkNoticeCity, IOffworkOilpriceInfo>> {
  const apiHost = 'http://apis.juhe.cn/gnyj/query'
  const key = process.env.JUHE_OIL_PRICE_API_KEY

  const url = `${apiHost}?key=${key}`
  const res = await axios.get(url).then(response => response.data)
  const result = get(res, 'result', [])

  const suzhou = result.find(t => t.city === '江苏')
  const beijing = result.find(t => t.city === '北京')
  const shanghai = result.find(t => t.city === '上海')

  return {
    suzhou,
    beijing,
    shanghai,
  }
}
