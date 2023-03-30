import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'

import { GitHelperService } from './git-helper.service'

@Controller('/git-helper')
export class GitHelperController {
  constructor(private readonly gitHelperService: GitHelperService) {}

  @Post('/project')
  @HttpCode(200)
  async addProject(@Body() body: { name: string }) {
    await this.gitHelperService.addProject(body.name)
  }

  @Get('/project/:name')
  @HttpCode(200)
  async getProjectById(@Param('name') name: string) {
    return await this.gitHelperService.selectProjectByName(name)
  }

  @Get('/project/:projectName/repo/:repoName')
  @HttpCode(200)
  async getRepoByProject(
    @Param('projectName') projectName: string,
    @Param('repoName') repoName: string
  ) {
    const project = await this.gitHelperService.selectProjectByName(projectName)
    const repo = await this.gitHelperService.selectRepoByNameAndProject(repoName, project)

    return repo
  }
}
