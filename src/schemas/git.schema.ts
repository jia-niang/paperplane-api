import { InjectModel, MongooseModule, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
class Git {}

const gitModelName = 'git'

export const GitDBInject = () => InjectModel(gitModelName)
export const GitModule = MongooseModule.forFeature([
  { name: gitModelName, schema: SchemaFactory.createForClass(Git) },
])
