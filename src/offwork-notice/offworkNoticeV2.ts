import { createCanvas, loadImage } from 'canvas'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import { createWriteStream } from 'fs'
import { round } from 'lodash'
import { tmpdir } from 'os'
import { resolve } from 'path'

import { uploadFileByPath } from '../utils/cos'
import { drawCircle } from '../utils/draw'
import { generateTrafficMap } from './trafficMap'

dayjs.extend(dayOfYear)

export async function generateOffworkNoticeImageCOSUrl(
  offworkRecord: IDailyOffworkRecord
): Promise<string> {
  return new Promise(async (resolvePromise, rejectPromise) => {
    const canvas = createCanvas(1500, 800)
    const ctx = canvas.getContext('2d')

    const bgNumber = 1 + (dayjs().dayOfYear() % 4)
    const bg = await loadImage(resolve(__dirname, `../res/bg/bg-${bgNumber}.jpg`))
    ctx.drawImage(bg, 0, 0, 1500, 800)

    // 大标题
    ctx.font = '170px "Source Han Sans CN"'
    ctx.fillText('下班了', 50, 180)

    // 倒计时
    const restDays = offworkRecord.salaryDay.restDays
    const countDownText = restDays <= 0 ? `今天是发薪日~` : `发薪倒计时 ${restDays} 天`
    ctx.textAlign = 'center'
    ctx.font = '60px "Source Han Sans CN"'
    ctx.fillText(countDownText, 300, 280)

    // 天气标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillRect(890, 30, 260, 100)
    ctx.fillRect(1210, 30, 260, 100)
    ctx.font = '30px "Source Han Sans CN"'
    ctx.fillStyle = '#fff'
    drawCircle(ctx, 890, 80, 22.5, 'rgb(67, 108, 165, 0.4)')
    ctx.fillText('今', 890, 91.5)
    drawCircle(ctx, 1210, 80, 22.5, 'rgb(67, 108, 165, 0.4)')
    ctx.fillText('明', 1210, 91.5)

    // 天气图标
    const weather = offworkRecord.weather.suzhou
    const todayWeatherImg = await loadImage(getWeatherImageByWid(weather.today.wid))
    ctx.drawImage(todayWeatherImg, 1050, 40, 80, 80)
    const tomorrowWeatherImg = await loadImage(getWeatherImageByWid(weather.tomorrow.wid))
    ctx.drawImage(tomorrowWeatherImg, 1370, 40, 80, 80)

    // 天气文本
    ctx.font = '30px "Source Han Sans CN"'
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.fillText(weather.today.info, 985, 70)
    ctx.fillText(weather.today.temperature + '℃', 985, 110)
    ctx.fillText(weather.tomorrow.weather, 1305, 70)
    ctx.fillText(weather.tomorrow.temperature, 1305, 110)

    // 股价标题
    ctx.lineWidth = 4
    ctx.fillStyle = 'rgba(67, 108, 165, 1)'
    ctx.fillRect(70 - 2, 690, 100, 60)
    ctx.fillStyle = '#000'
    ctx.font = '40px "Source Han Sans CN"'
    ctx.fillText('股价', 120, 735)

    // 股价线框
    ctx.textAlign = 'left'
    const delta = round(offworkRecord.stock.today - offworkRecord.stock.yesterday, 2)
    const signText = delta > 0 ? '+' : ''
    ctx.font = '30px "Source Han Sans CN"'
    const stockText = `${offworkRecord.stock.today} (${signText}${delta})`
    ctx.fillText(stockText, 190, 730)
    ctx.strokeStyle = 'rgba(67, 108, 165, 1)'
    ctx.strokeRect(170, 690 + 2, ctx.measureText(stockText).width + 40, 60 - 4)

    // 油价标题
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(67, 108, 165, 1)'
    ctx.fillRect(70 - 2, 470, 100, 60)
    ctx.fillStyle = '#000'
    ctx.font = '40px "Source Han Sans CN"'
    ctx.fillText('油价', 120, 515)

    // 油价线框
    ctx.strokeStyle = 'rgba(67, 108, 165, 1)'
    ctx.strokeRect(70, 540, 120, 130)
    ctx.strokeRect(190, 540, 120, 130)
    ctx.strokeRect(310, 540, 120, 130)

    // 油价表头
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.fillText('92#', 130, 590)
    ctx.fillText('95#', 130 + 120, 590)
    ctx.fillText('98#', 130 + 240, 590)

    // 油价数值
    ctx.fillStyle = '#000'
    const oilprice = offworkRecord.oilprice.suzhou
    ctx.fillText(oilprice['92h'], 130, 650)
    ctx.fillText(oilprice['95h'], 130 + 120, 650)
    ctx.fillText(oilprice['98h'], 130 + 240, 650)

    // 路况地图
    const screenShot = await loadImage(await generateTrafficMap())
    ctx.drawImage(screenShot, 870, 170, 600, 600)

    // 路况标题
    ctx.fillStyle = 'rgba(67, 108, 165, 1)'
    ctx.fillRect(1370, 170, 100, 60)
    ctx.fillStyle = '#000'
    ctx.font = '40px "Source Han Sans CN"'
    ctx.textAlign = 'center'
    ctx.fillText('路况', 1420, 215)

    const fileName = `img-${+new Date()}.png`
    const filePath = `${tmpdir}/${fileName}`

    const stream = canvas.createPNGStream()
    const ws = createWriteStream(filePath)
    stream.pipe(ws)

    ws.on('error', rejectPromise)
    ws.on('finish', () => {
      uploadFileByPath(`/dingtalk-offwork/${fileName}`, filePath, { usePaperplaneDomain: true })
        .then(fileInfo => void resolvePromise(fileInfo.Location))
        .catch(rejectPromise)
    })
  })
}

function getWeatherImageByWid(mid: string | number) {
  const numbericMid = Number(mid)

  const fileName = (function () {
    if (0 === numbericMid) return 'qing'
    if (1 === numbericMid) return 'duoyun'
    if (2 === numbericMid) return 'yin'
    if (3 === numbericMid) return 'zhenyu'
    if ([4, 5].includes(numbericMid)) return 'leizhenyu'
    if ([6, 19].includes(numbericMid)) return 'xiaoxue'
    if ([7, 21].includes(numbericMid)) return 'xiaoyu'
    if ([8, 9, 22].includes(numbericMid)) return 'zhongyu'
    if ([9, 10, 11, 12, 23, 24, 25].includes(numbericMid)) return 'dayu'
    if ([13, 14, 26].includes(numbericMid)) return 'xiaoxue'
    if ([15, 27].includes(numbericMid)) return 'zhongxue'
    if ([16, 17, 28].includes(numbericMid)) return 'daxue'
    if ([18, 20, 29, 30, 53].includes(numbericMid)) return 'wumai'
    if (31 === numbericMid) return 'taifeng'

    return 'unknown'
  })()

  return resolve(__dirname, `../res/weather/${fileName}.png`)
}
