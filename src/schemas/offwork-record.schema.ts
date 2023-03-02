import { InjectModel, MongooseModule, Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

function generateRawPropByCity<T>(input: T): Record<offworkNoticeCity, T> {
  return raw({ suzhou: input, beijing: input, shanghai: input })
}

@Schema()
export class DailyOffworkRecord {
  @Prop()
  date: string

  @Prop()
  isWorkDay: boolean

  @Prop(raw({ today: Number, yesterday: Number }))
  stock: IOffworkStockInfo

  @Prop(
    generateRawPropByCity({
      today: {
        info: String,
        temperature: String,
        wid: String,
      },
      tomorrow: {
        weather: String,
        temperature: String,
        wid: String,
      },
    })
  )
  weather: Record<offworkNoticeCity, IOffworkNoticeWeatherInfo>

  @Prop(
    generateRawPropByCity({
      '92h': String,
      '95h': String,
      '98h': String,
    })
  )
  oilprice: Record<offworkNoticeCity, IOffworkOilpriceInfo>

  @Prop(generateRawPropByCity(String))
  traffic: Record<offworkNoticeCity, string>

  @Prop(raw({ salaryDate: String, salaryDateText: String, restDays: Number }))
  salaryDay: IOffworkSalaryDayInfo
}

const offworkRecordModelName = 'offwork'

export type OffworkRecordDocument = HydratedDocument<DailyOffworkRecord>
export const OffworkRecordSchema = SchemaFactory.createForClass(DailyOffworkRecord)
export const OffworkRecordInject = () => InjectModel(offworkRecordModelName)
export const OffworkRecordModule = MongooseModule.forFeature([
  { name: offworkRecordModelName, schema: OffworkRecordSchema },
])
