import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'

import { OffworkRecordInject } from '@/schemas/offwork-record.schema'

@Injectable()
export class OffworkNoticeRecordService {
  constructor(
    @OffworkRecordInject()
    private offworkNoticeRecordModel: Model<IDailyOffworkRecord>
  ) {}

  async getRecordByDate(date: string): Promise<IDailyOffworkRecord> {
    return this.offworkNoticeRecordModel.findOne({ date })
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
    this.offworkNoticeRecordModel.deleteMany({ date })
  }
}
