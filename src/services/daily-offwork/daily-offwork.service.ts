import { Injectable, Logger } from '@nestjs/common'
import crypto from 'crypto'
import dayjs from 'dayjs'
import { PrismaService } from 'nestjs-prisma'
import puppeteer, { Browser } from 'puppeteer'

import { uploadFile } from '@/utils/cos'

import { IMessageRobotImage, MessageRobotService } from '../message-robot/message-robot.service'

const imageCount = 31
const darkThemeImages = [9, 15, 26]

@Injectable()
export class DailyOffworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageRobot: MessageRobotService
  ) {}

  private readonly logger = new Logger(DailyOffworkService.name)

  async sendTodayAll() {
    const allSetting = await this.prisma.offworkNoticeSetting.findMany({
      where: { disabled: false },
    })

    this.logger.log(`发送今日 offwork 消息，共 ${allSetting.length} 条`)

    for (const item of allSetting) {
      await this.sendByRobot(item.companyId, item.cityId, item.messageRobotId)
    }
  }

  async sendByRobot(companyId: string, cityId: string, robotId: string) {
    const image = await this.viewToImage(companyId, cityId)

    await this.messageRobot.sendImageByRobotId(robotId, image, {
      atAll: true,
      dingtalkTitle: '下班了',
    })
  }

  async viewToImage(companyId: string, cityId: string): Promise<IMessageRobotImage> {
    let browser: Browser
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage()
      await page.goto(
        `http://localhost:6100/daily-offwork/view/company/${companyId}/city/${cityId}`
      )
      await page.setViewport({ width: 1500, height: 800 })
      await page.waitForFunction('window.mapOK === true')
      const file = await page.screenshot()
      await page.close()
      browser.close()

      const now = dayjs()
      const url = await uploadFile(
        `/offwork-image/img-${now.format(
          'YYYY-MM-DD'
        )}-${companyId}-${cityId}-${now.valueOf()}.png`,
        file,
        { usePaperplaneDomain: true }
      ).then(fileInfo => fileInfo.Location)

      const base64 = file.toString('base64')

      const hash = crypto.createHash('md5')
      hash.update(file)
      const md5 = hash.digest('hex')

      return { url, base64, md5, file }
    } catch (e) {
      throw e
    } finally {
      browser?.close()
    }
  }

  async view(companyId: string, cityId: string) {
    const now = dayjs()
    const date = now.format('YYYY-MM-DD')

    const workdayRecord = await this.prisma.workdayRecord.findFirst({ where: { date } })

    const companyRecord = await this.prisma.dailyCompanyRecord.findFirst({
      where: { workdayRecordId: workdayRecord.id, companyId },
      include: { belongToCompany: true },
    })
    const company = companyRecord?.belongToCompany

    if (!company) {
      throw new Error(
        `未找到 ID 为 "${companyId}" 的公司记录，请检查提供的 ID 是否正确。如果 ID 无误，请确保生成当日生成记录时此公司已存在。`
      )
    }

    const cityRecord = await this.prisma.dailyCityRecord.findFirst({
      where: { workdayRecordId: workdayRecord.id, cityId },
      include: { belongToCity: true },
    })
    const city = cityRecord?.belongToCity

    if (!city) {
      throw new Error(
        `未找到 ID 为 "${cityId}" 的城市记录，请检查提供的 ID 是否正确以及此城市是否正确归属于公司 "${company.company}"。如果 ID 无误，请确保当日生成记录时此城市已存在。`
      )
    }

    const bgNumber = 1 + (now.dayOfYear() % imageCount)
    const darkTheme = darkThemeImages.includes(bgNumber)
    const bgUrl = `//localhost:6100/res/offwork-bg/${bgNumber}.jpg`

    const todayWeatherUrl = this.getWeatherImageUrl(cityRecord.todayWid, cityRecord.todayWeather)
    const tomorrowWeatherUrl = this.getWeatherImageUrl(
      cityRecord.tomorrowWid,
      cityRecord.tomorrowWeather
    )

    const signText = companyRecord.delta > 0 ? '+' : ''
    const stockText = `${companyRecord.todayStock} (${signText}${companyRecord.delta})`

    const viewData = {
      ...city,
      ...company,
      ...cityRecord,
      ...companyRecord,
      baiduMapAK: process.env.BAIDU_MAP_WEBSDK_AK,
      bgUrl,
      darkTheme,
      todayWeatherUrl,
      tomorrowWeatherUrl,
      stockText,
    }

    return viewData
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
