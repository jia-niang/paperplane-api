import DingtalkBot from 'dingtalk-robot-sender'

import { todayIsWorkdayApi } from '../../fetchers/workday'
import { beijingWeatherApi, shanghaiWeatherApi } from '../../fetchers/weather'
import { todayOilPriceApi } from '../../fetchers/oilprice'
import { beijingTrafficApi, shanghaiTrafficApi } from '../../fetchers/traffic'

export async function sendOtherOffworkNotice(bot: DingtalkBot) {
  const isWorkday = await todayIsWorkdayApi()
  if (!isWorkday) {
    return
  }

  let content = ''

  const oilprice = await todayOilPriceApi()

  {
    content += '在北京的 @15071204048 同学看这里：\n'

    const { today: todayWeather, tomorrow: tomorrowWeather } = await beijingWeatherApi()
    const { info, temperature } = todayWeather
    const { weather, temperature: tomorrowTemperature } = tomorrowWeather
    content += `※ 北京天气：${info} ${temperature}℃；明天：${weather} ${tomorrowTemperature}；\n`

    const { '92h': h92, '95h': h95, '98h': h98 } = oilprice.beijing
    content += `※ 北京油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#；\n`

    const traffic = await beijingTrafficApi()
    content += `※ 附近路况：${traffic}\n\n`
  }

  {
    content += '在上海的 @18317035969 同学看这里：\n'

    const { today: todayWeather, tomorrow: tomorrowWeather } = await shanghaiWeatherApi()
    const { info, temperature } = todayWeather
    const { weather, temperature: tomorrowTemperature } = tomorrowWeather
    content += `※ 上海天气：${info} ${temperature}℃；明天：${weather} ${tomorrowTemperature}；\n`

    const { '92h': h92, '95h': h95, '98h': h98 } = oilprice.shanghai
    content += `※ 上海油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#；\n`

    const traffic = await shanghaiTrafficApi()
    content += `※ 附近路况：${traffic}`
  }

  await bot.send({
    msgtype: 'text',
    text: { content },
    at: {
      isAtAll: false,
      atMobiles: ['15071204048', '18317035969'],
    },
  })
}
