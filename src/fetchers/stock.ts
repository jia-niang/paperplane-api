import { round, split } from 'lodash'
import axios from 'axios'

const url = 'http://hq.sinajs.cn/list=sz300662'

export interface IStorkApiResponse {
  today: number
  yesterday: number
}

export async function stockApi(): Promise<IStorkApiResponse> {
  const res = await axios
    .get(url, { headers: { Referer: 'http://finance.sina.com.cn' } })
    .then(response => response.data)
  const result = split(res.match(/"([^"]+)"/)[1] || '', ',')

  return {
    today: round(Number(result[3]), 2),
    yesterday: round(Number(result[2]), 2),
  }
}
