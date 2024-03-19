type offworkNoticeCity = 'suzhou' | 'beijing' | 'shanghai'

/** 下班提醒记录 */
interface IDailyOffworkRecord {
  date: string
  isWorkDay: boolean
  stock: {
    today: number
    yesterday: number
  }
  weather: Record<offworkNoticeCity, IOffworkNoticeWeatherInfo>
  oilprice: Record<offworkNoticeCity, IOffworkOilpriceInfo>
  traffic: Record<offworkNoticeCity, string>
  salaryDay: IOffworkSalaryDayInfo
}

/** 下班提醒天气信息 */
interface IOffworkNoticeWeatherInfo {
  today: {
    info: string
    temperature: string
    wid: string
  }
  tomorrow: {
    weather: string
    temperature: string
    wid: string
  }
}

/** 下班提醒油价信息 */
interface IOffworkOilpriceInfo {
  '92h': string
  '95h': string
  '98h': string
  '0h': string
}

/** 下班提醒发薪日信息 */
interface IOffworkSalaryDayInfo {
  salaryDate: string
  salaryDateText: string
  restDays: number
}

/** 下班提醒股价 */
interface IOffworkStockInfo {
  today: number
  yesterday: number
  delta?: number
}
