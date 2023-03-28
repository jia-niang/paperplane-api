import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class CommonDingtalkBot extends Document {
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

const dingtalkBotModelName = 'bots'

export const DingtalkBotDBInject = () => InjectModel(dingtalkBotModelName)
export const DingtalkBotModule = MongooseModule.forFeature([
  { name: dingtalkBotModelName, schema: SchemaFactory.createForClass(CommonDingtalkBot) },
])
