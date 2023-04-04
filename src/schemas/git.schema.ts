import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class GitCommit {
  @Prop({ required: true })
  hash: string

  @Prop({ required: true })
  date: string

  @Prop({ required: true })
  message: string

  @Prop({ required: true })
  author_name: string

  @Prop({ required: true })
  author_email: string

  @Prop()
  refs?: string
}

export const GitCommitSchema = SchemaFactory.createForClass(GitCommit)

@Schema()
export class GitRepo {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  url: string

  @Prop({ required: true, default: 'init' })
  status?: GitRepoStatusType

  @Prop()
  lastSyncTs?: number

  @Prop({ required: true, default: [] })
  recentBranches: string[]

  @Prop({ required: true, type: [GitCommitSchema], default: [] })
  recentCommits: GitCommit[]
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

  @Prop()
  weeklyText?: string
}

export const GitStaffSchema = SchemaFactory.createForClass(GitStaff)

@Schema({ versionKey: false })
export class GitProject extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, type: [GitRepoSchema], default: [] })
  repos: GitRepo[]

  @Prop({ required: true, type: [GitStaffSchema], default: [] })
  staffs: GitStaff[]

  @Prop({ required: true, default: 'init' })
  weeklyStatus: GitRepoStatusType

  @Prop()
  publicKey: string

  @Prop()
  privateKey: string
}

export const GitProjectSchema = SchemaFactory.createForClass(GitProject)

const gitModelName = 'gits'

export const GitDBInject = () => InjectModel(gitModelName)
export const GitModule = MongooseModule.forFeature([
  { name: gitModelName, schema: GitProjectSchema },
])
