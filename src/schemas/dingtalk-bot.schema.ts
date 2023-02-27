import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type DingtalkBotDocument = HydratedDocument<CommonDingtalkBot>

@Schema()
export class CommonDingtalkBot {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  scope: string

  @Prop({ required: true })
  type: DingtalkBotTypeAuthType

  @Prop()
  desc: string

  @Prop()
  avatar: string

  @Prop()
  accessToken: string

  @Prop()
  secret: string
}

export const DingtalkBotSchema = SchemaFactory.createForClass(CommonDingtalkBot)

const dingtalkBotModelName = 'bots'

export const DingtalkBotInject = () => InjectModel(dingtalkBotModelName)

export const DingtalkBotModule = MongooseModule.forFeature([
  { name: dingtalkBotModelName, schema: DingtalkBotSchema },
])
