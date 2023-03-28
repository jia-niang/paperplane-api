import { readFileSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'
import { Injectable } from '@nestjs/common'

import {
  listRecentCommitBranches,
  cloneOrSyncRepo,
  selectRepo,
  getRepoNameByUrl,
  listRecentCommits,
} from '@/git-action'

@Injectable()
export class GitService {
  public readonly sshPublicKey = readFileSync(resolve(homedir(), './.ssh/id_rsa.pub'))
    .toString()
    .trim()

  async clone(url: string) {
    await cloneOrSyncRepo(url)

    return { repoName: getRepoNameByUrl(url) }
  }

  async recentBranches(repoName: string, count: number) {
    const repo = await this.__selectRepo(repoName)
    const list = await listRecentCommitBranches(repo, count)

    return list
  }

  async pullAllRecentBranches(repoName: string, count: number) {
    const repo = await this.__selectRepo(repoName)
    const list = await listRecentCommitBranches(repo, count)

    for (const brancnName of list) {
      await repo.checkout(brancnName)
      await repo.pull()
    }

    return list
  }

  async listRecentCommits(repoName: string, branchName: string, days: number) {
    const repo = await this.__selectRepo(repoName)
    const list = await listRecentCommits(repo, branchName || 'master', days || 10)

    return list
  }

  async __selectRepo(repoName: string) {
    return selectRepo(repoName)
  }
}
