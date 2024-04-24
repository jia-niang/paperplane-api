import { Injectable, Logger } from '@nestjs/common'
import { GitCommit, GitCommonStatus, GitProject, GitRepo, GitStaff } from '@prisma/client'
import { uniqBy } from 'lodash'
import { PrismaService } from 'nestjs-prisma'

import { AiService } from '../ai/ai.service'
import {
  cloneOrSyncRepo,
  deleteRepo,
  generateAndWriteRSAKeyPair,
  getRepoNameByUrl,
  listRecentCommitBranches,
  listRecentCommits,
  prepareGitRepoPath,
} from './git-action'

@Injectable()
export class GitHelperService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {
    prepareGitRepoPath()
  }

  async addProject(newProject: GitProject) {
    newProject = await this.prisma.gitProject.create({ data: newProject })
    newProject = await this.prisma.gitProject.update({
      where: { id: newProject.id },
      data: generateAndWriteRSAKeyPair(newProject.id),
    })

    return newProject
  }

  async listAllProject() {
    return await this.prisma.gitProject.findMany({ select: { id: true, name: true } })
  }

  async selectProjectById(projectId: string) {
    const result = await this.prisma.gitProject.findFirstOrThrow({ where: { id: projectId } })
    result.privateKey = undefined

    return result
  }

  async deleteProject(projectId: string) {
    await this.prisma.gitProject.delete({ where: { id: projectId } })
  }

  async addRepo(projectId: string, repo: GitRepo) {
    const { url } = repo
    await this.prisma.gitProject.findFirstOrThrow({ where: { id: projectId } })

    const result = await this.prisma.gitRepo.create({
      data: { name: getRepoNameByUrl(url), url, gitProjectId: projectId },
    })

    return result
  }

  async selectRepo(projectId: string, repoId: string) {
    return await this.prisma.gitRepo.findFirstOrThrow({
      where: { id: repoId, gitProjectId: projectId },
    })
  }

  async deleteRepo(projectId: string, repoId: string) {
    await deleteRepo(repoId)
    await this.prisma.gitRepo.delete({ where: { id: repoId, gitProjectId: projectId } })
  }

  async syncRepo(projectId: string, repoId: string) {
    const repo = await this.prisma.gitRepo.findFirstOrThrow({
      where: { id: repoId, gitProjectId: projectId },
      include: { GitProject: true },
    })

    const project = repo.GitProject

    const syncTask = async () => {
      const git = await cloneOrSyncRepo({
        url: repo.url,
        projectId,
        repoId,
        privateKey: project.privateKey,
      })

      const branches = await listRecentCommitBranches(git, 10)
      await this.prisma.gitRepo.update({
        where: { id: repoId },
        data: { recentBranches: branches },
      })

      await this.prisma.gitCommit.deleteMany({ where: { gitRepoId: repoId } })
      let recentCommits = []
      for (const branch of branches) {
        const commits = await listRecentCommits(git, branch, 7)
        recentCommits = uniqBy(recentCommits.concat(commits), (item: GitCommit) => item.hash)
      }
      this.prisma.gitCommit.createMany({
        data: recentCommits.map(item => ({ ...item, gitRepoId: repoId })),
      })

      this.prisma.gitRepo.update({
        where: { id: repoId },
        data: { status: GitCommonStatus.READY, lastSync: new Date() },
      })
    }

    syncTask().catch(e => {
      Logger.error(`同步仓库 [${repo.name}] 时出错：`, e)

      this.prisma.gitRepo.update({
        where: { id: repoId },
        data: { status: GitCommonStatus.ERROR },
      })
    })
  }

  async aggregateCommits(projectId: string, repoId: string) {
    const repo = await this.prisma.gitRepo.findFirstOrThrow({
      where: { id: repoId, gitProjectId: projectId },
      include: { GitProject: { include: { staffs: true } }, recentCommits: true },
    })
    const project = repo.GitProject
    const staffs = project.staffs

    function lowCaseInclude(target: string, keywords: string) {
      return target.toLowerCase().includes(keywords.toLowerCase())
    }

    const result = staffs.reduce((r, current) => ({ ...r, [current.name]: [] }), {})
    repo.recentCommits.forEach(commit => {
      staffs.forEach(staff => {
        if (
          lowCaseInclude(commit.authorName, staff.name) ||
          staff.alternativeNames.some(t => lowCaseInclude(commit.authorName, t)) ||
          staff.emails.some(t => lowCaseInclude(commit.authorEmail, t))
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
        lowCaseInclude(commit.authorName, staff.name) ||
        staff.alternativeNames.some(t => lowCaseInclude(commit.authorName, t)) ||
        staff.emails.some(t => lowCaseInclude(commit.authorEmail, t))
      )
    }

    const project = await this.prisma.gitProject.findFirstOrThrow({
      where: { id: projectId },
      include: { staffs: true, repos: { include: { recentCommits: true } } },
    })
    const { staffs, repos } = project

    const staffList = staffId
      ? staffs.filter((item: GitStaff) => String(item.id) === staffId)
      : staffs

    await this.prisma.gitProject.update({
      where: { id: projectId },
      data: { weeklyStatus: GitCommonStatus.PENDING },
    })

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
        const aiText = `请根据我上周的 Git 提交记录生成一篇完整的工作周报，用 markdown 格式以分点叙述的形式输出，不需要大标题，提交记录：\n${commitJoinText}`

        const weekly = await this.aiService
          .completions(aiText)
          .then(text => text.slice(text.indexOf('#')))

        await this.prisma.gitReport.create({
          data: { content: weekly, gitProjectId: projectId, gitStaffId: staffId },
        })
      }

      await this.prisma.gitProject.update({
        where: { id: projectId },
        data: { weeklyStatus: GitCommonStatus.READY },
      })
    } catch (e) {
      Logger.error(`为项目 [${project.name}] 生成周报时候出错：`, e)

      await this.prisma.gitProject.update({
        where: { id: projectId },
        data: { weeklyStatus: GitCommonStatus.ERROR },
      })
    }
  }

  async addStaff(projectId: string, gitStaff: GitStaff) {
    return await this.prisma.gitStaff.create({ data: { ...gitStaff, gitProjectId: projectId } })
  }

  async deleteStaff(projectId: string, staffId: string) {
    await this.prisma.gitStaff.delete({ where: { id: staffId, gitProjectId: projectId } })
  }
}
