import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { GitProject, GitRepo, GitStaff } from '@prisma/client'

import { GitHelperService } from './git-helper.service'

@Controller('/git-helper')
export class GitHelperController {
  constructor(private readonly gitHelperService: GitHelperService) {}

  @Post('/project')
  async addProject(@Body() body: { project: GitProject }) {
    return this.gitHelperService.addProject(body.project)
  }

  @Get('/project')
  async listAllProject() {
    return this.gitHelperService.listAllProject()
  }

  @Get('/project/:projectId')
  async getProject(@Param('projectId') projectId: string) {
    return this.gitHelperService.selectProjectById(projectId)
  }

  @Delete('/project/:projectId')
  async deleteProject(@Param('projectId') projectId: string) {
    return this.gitHelperService.deleteProject(projectId)
  }

  @Post('/project/:projectId/repo')
  async addRepo(@Param('projectId') projectId: string, @Body() body: { repo: GitRepo }) {
    return this.gitHelperService.addRepo(projectId, body.repo)
  }

  @Get('/project/:projectId/repo/:repoId')
  async getRepo(@Param('projectId') projectId: string, @Param('repoId') repoId: string) {
    return this.gitHelperService.selectRepo(projectId, repoId)
  }

  @Delete('/project/:projectId/repo/:repoId')
  async deleteRepo(@Param('projectId') projectId: string, @Param('repoId') repoId: string) {
    return this.gitHelperService.deleteRepo(projectId, repoId)
  }

  @Post('/project/:projectId/staff')
  async addStaff(@Param('projectId') projectId: string, @Body() body: { staff: GitStaff }) {
    return this.gitHelperService.addStaff(projectId, body.staff)
  }

  @Delete('/project/:projectId/staff/:staffId')
  async deleteStaff(@Param('projectId') projectId: string, @Param('staffId') staffId: string) {
    return this.gitHelperService.deleteStaff(projectId, staffId)
  }

  @Post('/project/:projectId/repo/:repoId/sync')
  async syncRepo(@Param('projectId') projectId: string, @Param('repoId') repoId: string) {
    return this.gitHelperService.syncRepo(projectId, repoId)
  }

  @Post('/project/:projectId/repo/:repoId/aggregate-commits')
  async aggregateCommits(@Param('projectId') projectId: string, @Param('repoId') repoId: string) {
    return this.gitHelperService.aggregateCommits(projectId, repoId)
  }

  @Post('/project/:projectId/git-weekly')
  async gitWeekly(@Param('projectId') projectId: string) {
    this.gitHelperService.gitWeekly(projectId)
  }

  @Post('/project/:projectId/staff/:staffId/git-weekly')
  async gitWeeklyByStaffName(
    @Param('projectId') projectId: string,
    @Param('staffId') staffId: string
  ) {
    this.gitHelperService.gitWeekly(projectId, staffId)
  }
}
