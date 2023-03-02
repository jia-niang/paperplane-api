import { get } from 'lodash'
import axios from 'axios'

const url = 'http://apis.juhe.cn/gnyj/query?key=41d363ec1114fe9fb959adf4d301037f'

export async function todayOilPriceApi(): Promise<Record<offworkNoticeCity, IOffworkOilpriceInfo>> {
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
