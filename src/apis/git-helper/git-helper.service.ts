import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { last } from 'lodash'

import { GitDBInject, GitProject, GitStaff } from '@/schemas/git.schema'
import { cloneOrSyncRepo, getRepoNameByUrl, listRecentCommitBranches } from '@/git-action'

@Injectable()
export class GitHelperService {
  constructor(@GitDBInject() private readonly gitProjectModel: Model<GitProject>) {}

  async addProject(name: string) {
    const project = new this.gitProjectModel({ name })
    return await project.save()
  }

  async listAllProject() {
    return await this.gitProjectModel.find()
  }

  async selectProjectByName(name: string) {
    return await this.gitProjectModel.findOne({ name })
  }

  async projectAddRepo(projectName: string, url: string) {
    const project = await this.selectProjectByName(projectName)
    const name = getRepoNameByUrl(url)
    if (project.repos.find(item => item.url === url)) {
      throw new Error('此仓库已添加')
    }

    project.repos.push({ url, name, recentBranches: [] })
    await project.save()

    return last(project.repos)
  }

  async selectRepoByNameAndProject(projectName: string, name: string) {
    const project = await this.selectProjectByName(projectName)
    const repo = project.repos.find(repo => repo.name === name)

    return repo
  }

  async projectAddStaff(projectName: string, gitStaff: GitStaff) {
    const project = await this.selectProjectByName(projectName)
    project.staffs.push(gitStaff)
    await project.save()

    return last(project.staffs)
  }

  async syncRepo(projectName: string, repoName: string) {
    const project = await this.selectProjectByName(projectName)
    const repo = await this.selectRepoByNameAndProject(projectName, repoName)
    const git = await cloneOrSyncRepo(repo.url)
    const branches = await listRecentCommitBranches(git, 10)

    // project.repos.find(t => t.name === repoName).status = 'pending'
    // await project.save()

    // const syncBranches = async () => {
    //   for (const branch of branches) {
    //     await git.checkout(branch)
    //     await git.pull()
    //   }

    //   repo.recentBranches = branches
    //   repo.lastSyncTs = +new Date()
    //   repo.status = 'ready'

    //   const idx = project.repos.findIndex(t => t.name === repoName)
    //   project.repos[idx] = repo

    //   await project.save()
    // }
    // syncBranches()

    return branches
  }
}
