import dayjs from 'dayjs'
import axios from 'axios'

export async function todayIsWorkdayApi(): Promise<boolean> {
  const url = 'http://apis.juhe.cn/fapig/calendar/day.php'
  const key = process.env.JUHE_WORKDAY_API_KEY

  const now = dayjs()
  const dateStr = now.format('YYYY-MM-DD')
  const isWeekWorkday = now.day() >= 1 && now.day() <= 5
  const res = await axios.get(url + `?key=${key}&date=${dateStr}`).then(response => response.data)

  if (res.result.status === null) {
    return isWeekWorkday
  }

  return res.result.status === 2
}
