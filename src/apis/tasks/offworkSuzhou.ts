import DingtalkBot from 'dingtalk-robot-sender'

import { todayIsWorkdayApi } from '../../fetchers/workday'
import { suzhouWeatherApi } from '../../fetchers/weather'
import { todayOilPriceApi } from '../../fetchers/oilprice'
import { salaryDayApi } from '../../fetchers/salaryDay'
import { stockApi } from '../../fetchers/stock'
import { suzhouTrafficApi } from '../../fetchers/traffic'

export async function sendOffworkNotice(bot: DingtalkBot) {
  const isWorkday = await todayIsWorkdayApi()
  if (!isWorkday) {
    return
  }

  let content = '下班时间到啦，磨刀不误砍柴工，劳逸结合，不要太辛苦自己噢~\n\n'

  const { today: todayWeather, tomorrow: tomorrowWeather } = await suzhouWeatherApi()
  const { info, temperature } = todayWeather
  const { weather, temperature: tomorrowTemperature } = tomorrowWeather
  content += `※ 苏州天气：${info} ${temperature}℃；明天：${weather} ${tomorrowTemperature}；\n`

  const {
    jiangsu: { '92h': h92, '95h': h95, '98h': h98 },
  } = await todayOilPriceApi()
  content += `※ 苏州油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#；\n`

  const { today, yesterday } = await stockApi()
  content += `※ 科锐股价：今日 ${today}，昨日 ${yesterday}；\n`

  const traffic = await suzhouTrafficApi()
  content += `※ 附近路况：${traffic}\n\n`

  const { salaryDateText, restDays } = await salaryDayApi()
  if (restDays > 0) {
    content += `下次发薪日是${salaryDateText}，还有${restDays}天，加油！\n`
  } else if (restDays === 0) {
    content += `今天是发薪日，加油！\n`
  }

  await bot.send({
    msgtype: 'text',
    text: { content },
    at: { isAtAll: true, atMobiles: [] },
  })
}
