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
