import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'

import { GitDBInject, GitProject } from '@/schemas/git.schema'

@Injectable()
export class GitHelperService {
  constructor(@GitDBInject() private readonly gitProjectModel: Model<GitProject>) {}

  async addProject(name: string) {
    const project = new this.gitProjectModel({ name })
    await project.save()
  }

  async selectProjectByName(name: string) {
    return await this.gitProjectModel.findOne({ name })
  }

  async selectRepoByNameAndProject(name: string, project: GitProject) {
    return project.repos.find(repo => repo.name === name)
  }
}
