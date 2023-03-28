import { InjectModel, MongooseModule, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class Git extends Document {}

const gitModelName = 'git'

export const GitDBInject = () => InjectModel(gitModelName)
export const GitModule = MongooseModule.forFeature([
  { name: gitModelName, schema: SchemaFactory.createForClass(Git) },
])
