import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class GitRepo {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  url: string
}

export const GitRepoSchema = SchemaFactory.createForClass(GitRepo)

@Schema()
export class GitStaff {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, default: [] })
  emails: string[]

  @Prop({ required: true, default: [] })
  alternativeNames: string[]
}

export const GitStaffSchema = SchemaFactory.createForClass(GitStaff)

@Schema()
export class GitProject extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  scope: string

  @Prop({ required: true, type: [GitRepoSchema], default: [] })
  repos: GitRepo

  @Prop({ required: true, type: [GitStaffSchema], default: [] })
  staff: GitStaff[]
}

export const GitProjectSchema = SchemaFactory.createForClass(GitProject)

const gitModelName = 'gits'

export const GitDBInject = () => InjectModel(gitModelName)
export const GitModule = MongooseModule.forFeature([{ name: 'git', schema: GitProjectSchema }])
