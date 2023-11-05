import axios from 'axios'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import get from 'lodash/get'

dayjs.extend(duration)

export async function salaryDayApi(): Promise<IOffworkSalaryDayInfo> {
  const url = 'http://v.juhe.cn/calendar/month'
  const key = process.env.JUHE_HOLIDAY_API_KEY

  const now = dayjs()
  const dateStr = now.format('YYYY-M')
  const res = await axios
    .get(url + `?key=${key}&year-month=${dateStr}`)
    .then(response => response.data)

  const holidayInfoArray = get(res, 'result.data.holiday_array', [])
  const holidayObj = {}

  holidayInfoArray.forEach(item => {
    const list = item.list || []
    list.forEach(info => {
      const k = dayjs(info.date).format('MM-DD')
      const v = { holiday: Number(info.status) === 1 }
      holidayObj[k] = v
    })
  })

  const lastDay = now.endOf('month')
  let date = lastDay.clone()
  do {
    const holidayInfo = holidayObj[date.format('MM-DD')]
    const isWork = holidayInfo ? !holidayInfo.holiday : date.day() >= 1 && date.day() <= 5

    if (isWork) {
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
