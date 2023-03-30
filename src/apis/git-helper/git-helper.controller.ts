import { Body, Controller, Get, Param, Post } from '@nestjs/common'

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
  async getProjectById(@Param('name') name: string) {
    return this.gitHelperService.selectProjectByName(name)
  }

  @Post('/project/:projectName/repo')
  async addRepoByUrl(@Param('projectName') projectName: string, @Body() body: { url: string }) {
    return this.gitHelperService.projectAddRepo(projectName, body.url)
  }

  @Get('/project/:projectName/repo/:repoName')
  async getRepoByProject(
    @Param('projectName') projectName: string,
    @Param('repoName') repoName: string
  ) {
    return this.gitHelperService.selectRepoByNameAndProject(projectName, repoName)
  }

  @Post('/project/:projectName/staff')
  async addStaff(@Param('projectName') projectName: string, @Body() body: { staff: GitStaff }) {
    return this.gitHelperService.projectAddStaff(projectName, body.staff)
  }

  @Post('/project/:projectName/repo/:repoName/sync')
  async syncRepo(@Param('projectName') projectName: string, @Param('repoName') repoName: string) {
    return this.gitHelperService.syncRepo(projectName, repoName)
  }
}
