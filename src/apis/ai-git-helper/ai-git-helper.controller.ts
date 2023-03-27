import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'

import { getRepoNameByUrl } from '@/git-action'
import { AiGitHelperService } from './ai-git-helper.service'

@Controller('/git-helper')
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

  @Get('/recent-branches')
  async recentBranches(@Query() query: { repoName: string; count?: number }) {
    return this.aiGitHelperService.recentBranches(query.repoName, query.count || 10)
  }

  @Post('/pull-all-recent-branches')
  async pullAllRecentBranches(@Body() body: { repoName: string; count?: number }) {
    return this.aiGitHelperService.pullAllRecentBranches(body.repoName, body.count || 10)
  }

  @Get('/recent-commits')
  async recentCommits(@Query() query: { repoName: string; branchName?: string; days?: number }) {
    return this.aiGitHelperService.listRecentCommits(
      query.repoName,
      query.branchName || 'master',
      query.days || 7
    )
  }
}
