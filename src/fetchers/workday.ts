import dayjs from 'dayjs'
import axios from 'axios'

const url = 'http://apis.juhe.cn/fapig/calendar/day.php'
const key = '0fa335a5572a79105d326a63fe3d9476'

export async function todayIsWorkdayApi(): Promise<boolean> {
  const now = dayjs()
  const dateStr = now.format('YYYY-MM-DD')
  const isWeekWorkday = now.day() >= 1 && now.day() <= 5
  const res = await axios.get(url + `?key=${key}&date=${dateStr}`).then(response => response.data)

  if (res.result.status === null) {
    return isWeekWorkday
  }

  return res.result.status === 2
}
