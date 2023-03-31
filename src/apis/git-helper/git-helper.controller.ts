import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { GitStaff } from '@/schemas/git.schema'
import { GitHelperService } from './git-helper.service'

@Controller('/git-helper')
export class GitHelperController {
  constructor(private readonly gitHelperService: GitHelperService) {}

  @Post('/project')
  async addProject(@Body() body: { name: string }) {
    return this.gitHelperService.addProject(body.name)
  }

  @Get('/project')
  async listAllProject() {
    return this.gitHelperService.listAllProject()
  }

  @Get('/project/:name')
  async getProject(@Param('name') name: string) {
    return this.gitHelperService.selectProjectByName(name)
  }

  @Post('/project/:projectName/repo')
  async addRepo(@Param('projectName') projectName: string, @Body() body: { url: string }) {
    return this.gitHelperService.addRepo(projectName, body.url)
  }

  @Get('/project/:projectName/repo/:repoName')
  async getRepo(@Param('projectName') projectName: string, @Param('repoName') repoName: string) {
    return this.gitHelperService.selectRepo(projectName, repoName)
  }

  @Delete('/project/:projectName/repo/:repoName')
  async deleteRepo(@Param('projectName') projectName: string, @Param('repoName') repoName: string) {
    return this.gitHelperService.deleteRepo(projectName, repoName)
  }

  @Post('/project/:projectName/staff')
  async addStaff(@Param('projectName') projectName: string, @Body() body: { staff: GitStaff }) {
    return this.gitHelperService.addStaff(projectName, body.staff)
  }

  @Delete('/project/:projectName/staff/:staffName')
  async deleteStaff(
    @Param('projectName') projectName: string,
    @Param('staffName') staffName: string
  ) {
    return this.gitHelperService.deleteStaff(projectName, staffName)
  }

  @Post('/project/:projectName/repo/:repoName/sync')
  async syncRepo(@Param('projectName') projectName: string, @Param('repoName') repoName: string) {
    return this.gitHelperService.syncRepo(projectName, repoName)
  }

  @Post('/project/:projectName/repo/:repoName/aggregate-commits')
  async aggregateCommits(
    @Param('projectName') projectName: string,
    @Param('repoName') repoName: string
  ) {
    return this.gitHelperService.aggregateCommits(repoName, repoName)
  }

  @Post('/project/:projectName/git-weekly')
  async gitWeekly(@Param('projectName') projectName: string) {
    return this.gitHelperService.gitWeekly(projectName)
  }
}
