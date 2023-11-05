import dayjs from 'dayjs'

import { todayOilPriceApi } from '../fetchers/oilprice'
import { salaryDayApi } from '../fetchers/salaryDay'
import { stockApi } from '../fetchers/stock'
import { suzhouTrafficApi, beijingTrafficApi, shanghaiTrafficApi } from '../fetchers/traffic'
import { suzhouWeatherApi, beijingWeatherApi, shanghaiWeatherApi } from '../fetchers/weather'
import { todayIsWorkdayApi } from '../fetchers/workday'

export async function fetchOffworkRecord(): Promise<IDailyOffworkRecord> {
  const [isWorkDay, oilprice, stock, salaryDay, weather, traffic] = await Promise.all([
    todayIsWorkdayApi(),
    todayOilPriceApi(),
    stockApi(),
    salaryDayApi(),
    Promise.all([suzhouWeatherApi(), beijingWeatherApi(), shanghaiWeatherApi()]).then(
      ([suzhou, beijing, shanghai]) => ({ suzhou, beijing, shanghai })
    ),
    Promise.all([suzhouTrafficApi(), beijingTrafficApi(), shanghaiTrafficApi()]).then(
      ([suzhou, beijing, shanghai]) => ({ suzhou, beijing, shanghai })
    ),
  ])

  return {
    date: dayjs().format('YYYY-MM-DD'),
    isWorkDay,
    oilprice,
    stock,
    salaryDay,
    weather,
    traffic,
  }
}
