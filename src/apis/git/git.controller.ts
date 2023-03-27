import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common'

import { getRepoNameByUrl } from '@/git-action'
import { AiGitHelperService } from './git.service'

@Controller('/git')
export class AiGitHelperController {
  constructor(private readonly aiGitHelperService: AiGitHelperService) {}

  @Get('/public-key')
  async publicKey() {
    return this.aiGitHelperService.sshPublicKey
  }

  @Post('/clone')
  @HttpCode(200)
  async clone(@Body() body: { url: string }) {
    const repoName = getRepoNameByUrl(body.url)
    await this.aiGitHelperService.clone(body.url)

    return { repoName }
  }

  @Get('/repo/:repoName/recent-branches')
  async recentBranches(@Param('repoName') repoName: string, @Query() query: { count?: number }) {
    return this.aiGitHelperService.recentBranches(repoName, query.count || 10)
  }

  @Post('/repo/:repoName/pull-all-recent-branches')
  async pullAllRecentBranches(
    @Param('repoName') repoName: string,
    @Query() query: { count?: number }
  ) {
    return this.aiGitHelperService.pullAllRecentBranches(repoName, query.count || 10)
  }

  @Get('/repo/:repoName/branch/:branchName/recent-commits')
  async recentCommits(
    @Param('repoName') repoName: string,
    @Param('branchName') branchName: string,
    @Query() query: { days?: number }
  ) {
    return this.aiGitHelperService.listRecentCommits(
      repoName,
      branchName || 'master',
      query.days || 7
    )
  }
}
