import DingtalkBot from 'dingtalk-robot-sender'

export async function sendOffworkNotice(bot: DingtalkBot, offworkRecord: IDailyOffworkRecord) {
  if (!offworkRecord.isWorkDay) {
    return
  }

  let content = '下班时间到啦，磨刀不误砍柴工，劳逸结合，不要太辛苦自己噢~\n\n'

  const { today: todayWeather, tomorrow: tomorrowWeather } = offworkRecord.weather.suzhou
  const { info, temperature } = todayWeather
  const { weather, temperature: tomorrowTemperature } = tomorrowWeather
  content += `※ 苏州天气：${info} ${temperature}℃；明天：${weather} ${tomorrowTemperature}；\n`

  const {
    suzhou: { '92h': h92, '95h': h95, '98h': h98 },
  } = offworkRecord.oilprice
  content += `※ 苏州油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#；\n`

  const { today, yesterday } = offworkRecord.stock
  content += `※ 科锐股价：今日 ${today}，昨日 ${yesterday}；\n`

  const traffic = offworkRecord.traffic.suzhou
  content += `※ 附近路况：${traffic}\n\n`

  const { salaryDateText, restDays } = offworkRecord.salaryDay
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
