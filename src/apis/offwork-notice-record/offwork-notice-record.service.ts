import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { Model } from 'mongoose'
import puppeteer from 'puppeteer'

import { OffworkRecordDBInject } from '@/schemas/offwork-record.schema'
import { uploadFile } from '@/utils/cos'

@Injectable()
export class OffworkNoticeRecordService {
  constructor(
    @OffworkRecordDBInject()
    private offworkNoticeRecordModel: Model<IDailyOffworkRecord>
  ) {}

  async getRecordByDate(date: string) {
    return (await this.offworkNoticeRecordModel.findOne({ date })).toJSON()
  }

  async getTodayRecord(): Promise<IDailyOffworkRecord> {
    return this.getRecordByDate(dayjs().format('YYYY-MM-DD'))
  }

  async addRecord(record: IDailyOffworkRecord) {
    const newRecord = new this.offworkNoticeRecordModel(record)
    await newRecord.save()
  }

  async addTodayRecord(record: IDailyOffworkRecord) {
    const todayDate = dayjs().format('YYYY-MM-DD')
    await this.deleteRecordsByDate(todayDate)
    await this.addRecord(record)
  }

  async deleteRecordsByDate(date: string) {
    await this.offworkNoticeRecordModel.deleteMany({ date })
  }

  async offworkNoticeViewByRecord(record: IDailyOffworkRecord) {
    const date = dayjs(record.date)

    const bgTotal = 31
    const bgNumber = 1 + (date.dayOfYear() % bgTotal)
    const darkTheme = [9, 15, 26].includes(bgNumber)
    const bgUrl = `//localhost:6100/res/offwork-bg/${bgNumber}.jpg`

    const weather = record.weather.suzhou
    const todayWeatherUrl = this.getWeatherImageUrl(weather.today.wid, weather.today.info)
    const tomorrowWeatherUrl = this.getWeatherImageUrl(
      weather.tomorrow.wid,
      weather.tomorrow.weather
    )

    const delta = round(record.stock.today - record.stock.yesterday, 2)
    const signText = delta > 0 ? '+' : ''
    const stockText = `${record.stock.today} (${signText}${delta})`

    return {
      ...record,
      baiduMapAK: process.env.BAIDU_MAP_WEBSDK_AK,
      bgUrl,
      darkTheme,
      todayWeatherUrl,
      tomorrowWeatherUrl,
      stockText,
    }
  }

  async offworkNoticeViewByDate(dateString: string) {
    const todayRecord = await this.getRecordByDate(dateString)
    const result = await this.offworkNoticeViewByRecord(todayRecord)

    return result
  }

  async offworkNoticeImageScreenshotByRecord(record: IDailyOffworkRecord) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.goto('http://localhost:6100/offwork-record/view/' + record.date)
    await page.setViewport({ width: 1500, height: 800 })
    await page.waitForFunction('window.mapOK === true')
    const result = await page.screenshot()
    await page.close()
    browser.close()

    const imageUrl = await uploadFile(`/dingtalk-offwork/img-${+new Date()}.png`, result, {
      usePaperplaneDomain: true,
    }).then(fileInfo => fileInfo.Location)

    return imageUrl
  }

  private getWeatherImageUrl(mid: string | number, weatherName?: string) {
    const numbericMid = Number(mid)

    const fileName = (function () {
      // 存在例如“阴转小雨”的情况且 wid 仍为 0~2，此时应优先展示含有“雨”的图标
      if ([0, 1, 2].includes(numbericMid) && weatherName?.includes('雨')) {
        if (weatherName?.includes('小雨')) return 'xiaoyu'
        if (weatherName?.includes('中雨')) return 'zhongyu'
        if (weatherName?.includes('大雨')) return 'dayu'
        return 'xiaoyu'
      }

      if ([0, 1, 2].includes(numbericMid) && weatherName?.includes('雪')) {
        if (weatherName?.includes('小雪')) return 'xiaoxue'
        if (weatherName?.includes('中雪')) return 'zhongxue'
        if (weatherName?.includes('大雪')) return 'daxue'
        return 'xiaoxue'
      }

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

    return `//localhost:6100/res/weather/${fileName}.png`
  }
}
