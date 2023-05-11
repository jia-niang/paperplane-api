import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { last, uniqBy } from 'lodash'

import {
  DraftGitProject,
  DraftGitRepo,
  GitCommit,
  GitDBInject,
  GitProject,
  GitRepo,
  GitStaff,
} from '@/schemas/git.schema'
import {
  cloneOrSyncRepo,
  deleteRepo,
  generateAndWriteRSAKeyPair,
  getRepoNameByUrl,
  listRecentCommitBranches,
  listRecentCommits,
  prepareGitRepoPath,
} from '@/git-action'
import { AiService } from '../ai/ai.service'

@Injectable()
export class GitHelperService {
  constructor(
    @GitDBInject() private readonly gitProjectModel: Model<GitProject>,
    private readonly aiService: AiService
  ) {
    prepareGitRepoPath()
  }

  async addProject(newProject: DraftGitProject) {
    const project = new this.gitProjectModel(newProject)
    await project.save()

    Object.assign(project, generateAndWriteRSAKeyPair(String(project._id)))
    await project.save()

    return await this.selectProjectById(project._id)
  }

  async listAllProject() {
    const allProjects = await this.gitProjectModel.find()
    const result = allProjects.map(item => ({ _id: item._id, name: item.name }))

    return result
  }

  async selectProjectById(projectId: string, hidePrivateKey?: boolean) {
    const projection: Partial<Record<keyof GitProject, 1 | 0>> = {}
    if (hidePrivateKey) {
      projection.privateKey = 0
    }

    return await this.gitProjectModel.findById(new Types.ObjectId(projectId), projection)
  }

  async addRepo(projectId: string, repo: DraftGitRepo) {
    const { url } = repo
    const project = await this.selectProjectById(projectId)
    const name = getRepoNameByUrl(url)

    if (project.repos.find(item => item.url === url)) {
      throw new Error('此仓库已添加')
    }

    project.repos.push({ url, name, recentBranches: [], recentCommits: [] })
    await project.save()

    return last(project.repos)
  }

  async selectRepo(projectId: string, repoId: string) {
    const project = await this.selectProjectById(projectId)
    const repo = project.repos.find((repo: GitRepo & IWithId) => String(repo._id) === repoId)

    return repo
  }

  async deleteRepo(projectId: string, repoId: string) {
    await deleteRepo(projectId)
    const project = await this.selectProjectById(projectId)

    project.repos = project.repos.filter((repo: GitRepo & IWithId) => String(repo._id) !== repoId)
    await project.save()
  }

  async syncRepo(projectId: string, repoId: string) {
    const project = await this.selectProjectById(projectId)
    const repo = project.repos.find((t: GitRepo & IWithId) => String(t._id) === repoId) as GitRepo &
      IWithId

    repo.status = 'pending'
    await project.save()

    const syncTask = async () => {
      const git = await cloneOrSyncRepo({
        url: repo.url,
        projectId: String(project._id),
        repoId: String(repo._id),
        privateKey: project.privateKey,
      })
      const branches = await listRecentCommitBranches(git, 10)

      repo.recentBranches = branches
      repo.recentCommits = []
      await project.save()

      let recentCommits = []
      for (const branch of branches) {
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

  async aggregateCommits(projectId: string, repoId: string) {
    const project = await this.selectProjectById(projectId)
    const repo = project.repos.find((t: GitRepo & IWithId) => String(t._id) === repoId)
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

  async gitWeekly(projectId: string, staffId?: string) {
    function isMyCommit(staff: GitStaff, commit: GitCommit) {
      function lowCaseInclude(target: string, keywords: string) {
        return target.toLowerCase().includes(keywords.toLowerCase())
      }

      return (
        lowCaseInclude(commit.author_name, staff.name) ||
        staff.alternativeNames.some(t => lowCaseInclude(commit.author_name, t)) ||
        staff.emails.some(t => lowCaseInclude(commit.author_email, t))
      )
    }

    const project = await this.selectProjectById(projectId)
    const { staffs, repos } = project

    const staffList = staffId
      ? staffs.filter((item: GitStaff & IWithId) => String(item._id) === staffId)
      : staffs

    project.weeklyStatus = 'pending'
    await project.save()

    try {
      for (const staff of staffList) {
        let commitList: GitCommit[] = []

        for (const repo of repos) {
          commitList = commitList.concat(repo.recentCommits.filter(item => isMyCommit(staff, item)))
        }

        commitList = commitList.filter(item => !item.message.startsWith('Merge'))
        commitList = commitList.filter(item => !item.message.startsWith('fix: #'))
        commitList = commitList.filter(item => !item.message.startsWith('refactor: lint'))

        const commitJoinText = commitList.map(t => t.message).join('\n')
        const aiText = `一份周报分为5个章节：目标和进度、详细进展、复盘与思考、需要的帮助和支持、后续行动项，其中“目标与进度”章节内容固定为“待补充”，“复盘与思考”、“需要的帮助和支持”章节的内容固定为“暂无”，不需要大标题，请根据我上周的 Git 提交记录填充为一篇完整的周报，用 markdown 格式以分点叙述的形式输出：${commitJoinText}`

        const weekly = await this.aiService
          .completions(aiText)
          .then(text => text.slice(text.indexOf('#')))

        staff.weeklyText = weekly
        await project.save()
      }

      project.weeklyStatus = 'ready'
      project.save()
    } catch {
      project.weeklyStatus = 'error'
      project.save()
    }
  }

  async addStaff(projectId: string, gitStaff: GitStaff) {
    const project = await this.selectProjectById(projectId)
    project.staffs.push(gitStaff)
    await project.save()

    return last(project.staffs)
  }

  async deleteStaff(projectId: string, staffId: string) {
    const project = await this.selectProjectById(projectId)
    project.staffs = project.staffs.filter(
      (staff: GitStaff & IWithId) => String(staff._id) !== staffId
    )
    await project.save()
  }
}
