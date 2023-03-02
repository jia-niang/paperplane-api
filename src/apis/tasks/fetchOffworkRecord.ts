import { todayIsWorkdayApi } from '../../fetchers/workday'
import { suzhouWeatherApi, beijingWeatherApi, shanghaiWeatherApi } from '../../fetchers/weather'
import { suzhouTrafficApi, beijingTrafficApi, shanghaiTrafficApi } from '../../fetchers/traffic'
import { todayOilPriceApi } from '../../fetchers/oilprice'
import { salaryDayApi } from '../../fetchers/salaryDay'
import { stockApi } from '../../fetchers/stock'
import dayjs from 'dayjs'

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
