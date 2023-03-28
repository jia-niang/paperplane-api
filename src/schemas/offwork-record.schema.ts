import { InjectModel, MongooseModule, Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

const cities: offworkNoticeCity[] = ['suzhou', 'beijing', 'shanghai']

function generateRawPropByCities<T>(input: T): Record<offworkNoticeCity, T> {
  return raw(cities.reduce((obj, city) => ({ ...obj, [city]: input }), {}))
}

@Schema()
export class DailyOffworkRecord extends Document {
  @Prop()
  date: string

  @Prop()
  isWorkDay: boolean

  @Prop(raw({ today: Number, yesterday: Number }))
  stock: IOffworkStockInfo

  @Prop(
    generateRawPropByCities({
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
    generateRawPropByCities({
      '92h': String,
      '95h': String,
      '98h': String,
    })
  )
  oilprice: Record<offworkNoticeCity, IOffworkOilpriceInfo>

  @Prop(generateRawPropByCities(String))
  traffic: Record<offworkNoticeCity, string>

  @Prop(raw({ salaryDate: String, salaryDateText: String, restDays: Number }))
  salaryDay: IOffworkSalaryDayInfo
}

const offworkRecordModelName = 'offwork'

export const OffworkRecordDBInject = () => InjectModel(offworkRecordModelName)
export const OffworkRecordModule = MongooseModule.forFeature([
  { name: offworkRecordModelName, schema: SchemaFactory.createForClass(DailyOffworkRecord) },
])
