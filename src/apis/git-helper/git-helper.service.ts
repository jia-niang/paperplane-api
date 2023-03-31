import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { last, uniqBy } from 'lodash'

import { GitCommit, GitDBInject, GitProject, GitStaff } from '@/schemas/git.schema'
import {
  cloneOrSyncRepo,
  deleteRepo,
  getRepoNameByUrl,
  listRecentCommitBranches,
  listRecentCommits,
} from '@/git-action'
import { AiService } from '../ai/ai.service'

@Injectable()
export class GitHelperService {
  constructor(
    @GitDBInject() private readonly gitProjectModel: Model<GitProject>,
    private readonly aiService: AiService
  ) {}

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

  async addRepo(projectName: string, url: string) {
    const project = await this.selectProjectByName(projectName)
    const name = getRepoNameByUrl(url)
    if (project.repos.find(item => item.url === url)) {
      throw new Error('此仓库已添加')
    }

    project.repos.push({ url, name, recentBranches: [], recentCommits: [] })
    await project.save()

    return last(project.repos)
  }

  async selectRepo(projectName: string, name: string) {
    const project = await this.selectProjectByName(projectName)
    const repo = project.repos.find(repo => repo.name === name)

    return repo
  }

  async deleteRepo(projectName: string, repoName: string) {
    await deleteRepo(repoName)
    const project = await this.selectProjectByName(projectName)
    project.repos = project.repos.filter(item => item.name !== repoName)
    await project.save()
  }

  async syncRepo(projectName: string, repoName: string) {
    const project = await this.selectProjectByName(projectName)
    const repo = project.repos.find(t => t.name === repoName)

    repo.status = 'pending'
    await project.save()

    const syncTask = async () => {
      const git = await cloneOrSyncRepo(repo.url)
      const branches = await listRecentCommitBranches(git, 10)

      repo.recentBranches = branches
      repo.recentCommits = []
      await project.save()

      let recentCommits = []
      for (const branch of branches) {
        await git.checkout(branch)
        await git.pull()

        const commits = await listRecentCommits(git, branch, 7)
        recentCommits = uniqBy(recentCommits.concat(commits), (item: GitCommit) => item.hash)
      }

      repo.recentCommits = recentCommits
      repo.lastSyncTs = +new Date()
      repo.status = 'ready'

      await project.save()
    }

    syncTask().catch(() => {
      repo.status = 'error'
      project.save()
    })
  }

  async aggregateCommits(projectName: string, repoName: string) {
    const project = await this.selectProjectByName(projectName)
    const repo = project.repos.find(t => t.name === repoName)
    const staffs = project.staffs

    function lowCaseInclude(target: string, keywords: string) {
      return target.toLowerCase().includes(keywords.toLowerCase())
    }

    const result = staffs.reduce((r, current) => ({ ...r, [current.name]: [] }), {})
    repo.recentCommits.forEach(commit => {
      staffs.forEach(staff => {
        if (
          lowCaseInclude(commit.author_name, staff.name) ||
          staff.alternativeNames.some(t => lowCaseInclude(commit.author_name, t)) ||
          staff.emails.some(t => lowCaseInclude(commit.author_email, t))
        ) {
          result[staff.name].push(commit)
        }
      })
    })

    return result
  }

  async gitWeekly(projectName: string) {
    const project = await this.selectProjectByName(projectName)

    const aggregateCommits = project.staffs.reduce(
      (r, current) => ({ ...r, [current.name]: [] }),
      {}
    )

    for (const repo of project.repos) {
      const commitObject = await this.aggregateCommits(projectName, repo.name)
      Object.entries(commitObject).forEach(([k, v]) => {
        let commitList: GitCommit[] = aggregateCommits[k].concat(v)

        commitList = commitList.filter(item => !item.message.startsWith('Merge'))
        commitList = commitList.filter(item => !item.message.startsWith('fix: #'))
        commitList = commitList.filter(item => !item.message.startsWith('refactor: lint'))

        aggregateCommits[k] = commitList
      })
    }

    const result: Record<string, string> = {}
    const entries = Object.entries(aggregateCommits)
    for (const kvPair of entries) {
      const [k, v] = kvPair as [string, string[]]

      const commitText = v.join('\n')
      const aiText = `一份周报分为5个章节：目标和进度、详细进展、复盘与思考、需要的帮助和支持、后续行动项，其中“目标与进度”章节内容固定为“待补充”，“复盘与思考”、“需要的帮助和支持”章节的内容固定为“暂无”，不需要大标题，请根据我上周的 Git 提交记录填充为一篇完整的周报，用 markdown 格式以分点叙述的形式输出：${commitText}`
      const answer = await this.aiService.completions(aiText)

      result[k] = answer
    }

    return result
  }

  async addStaff(projectName: string, gitStaff: GitStaff) {
    const project = await this.selectProjectByName(projectName)
    project.staffs.push(gitStaff)
    await project.save()

    return last(project.staffs)
  }

  async deleteStaff(projectName: string, staffName: string) {
    const project = await this.selectProjectByName(projectName)
    project.staffs = project.staffs.filter(item => item.name !== staffName)
    await project.save()
  }
}
