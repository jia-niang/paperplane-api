export async function generateOtherOffworkNoticeMessage(
  offworkRecord: IDailyOffworkRecord
): Promise<IDingtalkTextMessage> {
  let content = ''
  const { oilprice } = offworkRecord

  {
    content += '在北京的 Waiho 同学看这里：\n'

    const { today: todayWeather, tomorrow: tomorrowWeather } = offworkRecord.weather.beijing
    const { info, temperature } = todayWeather
    const { weather, temperature: tomorrowTemperature } = tomorrowWeather
    content += `※ 北京天气：${info} ${temperature}℃；明天：${weather} ${tomorrowTemperature}；\n`

    const { '92h': h92, '95h': h95, '98h': h98 } = oilprice.beijing
    content += `※ 北京油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#；\n`

    const traffic = offworkRecord.traffic.beijing
    content += `※ 附近路况：${traffic}\n\n`
  }

  {
    content += '在上海的 Niki 同学看这里：\n'

    const { today: todayWeather, tomorrow: tomorrowWeather } = offworkRecord.weather.shanghai
    const { info, temperature } = todayWeather
    const { weather, temperature: tomorrowTemperature } = tomorrowWeather
    content += `※ 上海天气：${info} ${temperature}℃；明天：${weather} ${tomorrowTemperature}；\n`

    const { '92h': h92, '95h': h95, '98h': h98 } = oilprice.shanghai
    content += `※ 上海油价：￥${h92}/92#，￥${h95}/95#，￥${h98}/98#；\n`

    const traffic = offworkRecord.traffic.shanghai
    content += `※ 附近路况：${traffic}`
  }

  return {
    msgtype: 'text',
    text: { content },
    at: { isAtAll: false, atMobiles: [] },
  }
}
