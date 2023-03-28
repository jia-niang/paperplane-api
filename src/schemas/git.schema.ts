import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class GitRepo {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  url: string
}

@Schema()
export class GitStaff {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, default: [] })
  emails: string[]

  @Prop({ required: true, default: [] })
  alternativeNames: string[]
}

@Schema()
export class GitProject extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  scope: string

  @Prop({ required: true, type: [GitRepo], default: [] })
  repos: GitRepo[]

  @Prop({ required: true, type: [GitStaff], default: [] })
  staff: GitStaff[]
}

const gitModelName = 'git'

export const GitDBInject = () => InjectModel(gitModelName)
export const GitModule = MongooseModule.forFeature([
  { name: 'git', schema: SchemaFactory.createForClass(GitProject) },
])
