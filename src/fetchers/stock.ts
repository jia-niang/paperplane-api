import axios from 'axios'
import { round, split } from 'lodash'

const url = 'http://hq.sinajs.cn/list=sz300662'

export async function stockApi(): Promise<IOffworkStockInfo> {
  const res = await axios
    .get(url, { headers: { Referer: 'http://finance.sina.com.cn' } })
    .then(response => response.data)
  const result = split(res.match(/"([^"]+)"/)[1] || '', ',')

  return {
    today: round(Number(result[3]), 2),
    yesterday: round(Number(result[2]), 2),
  }
}
