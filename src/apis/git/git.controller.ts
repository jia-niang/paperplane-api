import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'

import { getRepoNameByUrl } from '@/git-action'
import { GitService } from './git.service'

@Controller('/git')
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Get('/public-key')
  async publicKey() {
    return this.gitService.sshPublicKey
  }

  @Post('/clone')
  async clone(@Body() body: { url: string }) {
    const repoName = getRepoNameByUrl(body.url)
    await this.gitService.clone(body.url)

    return { repoName }
  }

  @Get('/repo/:repoName/recent-branches')
  async recentBranches(@Param('repoName') repoName: string, @Query() query: { count?: number }) {
    return this.gitService.recentBranches(repoName, query.count || 10)
  }

  @Post('/repo/:repoName/pull-all-recent-branches')
  async pullAllRecentBranches(
    @Param('repoName') repoName: string,
    @Query() query: { count?: number }
  ) {
    return this.gitService.pullAllRecentBranches(repoName, query.count || 10)
  }

  @Get('/repo/:repoName/branch/:branchName/recent-commits')
  async recentCommits(
    @Param('repoName') repoName: string,
    @Param('branchName') branchName: string,
    @Query() query: { days?: number }
  ) {
    return this.gitService.listRecentCommits(repoName, branchName || 'master', query.days || 7)
  }
}
