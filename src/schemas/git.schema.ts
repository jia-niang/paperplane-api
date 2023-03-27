import { InjectModel, MongooseModule, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema()
class Git {}

const gitModelName = 'git'

export type GitDocument = HydratedDocument<Git>
export const GitSchema = SchemaFactory.createForClass(Git)
export const GitInject = () => InjectModel(gitModelName)
export const GitModule = MongooseModule.forFeature([{ name: gitModelName, schema: GitSchema }])
