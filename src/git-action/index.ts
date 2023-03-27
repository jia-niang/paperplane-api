import { existsSync, rmSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'
import simpleGit, { SimpleGit } from 'simple-git'

/** 克隆新仓库或同步现存仓库 */
export async function cloneOrSyncRepo(url: string) {
  const repoName = getRepoNameByUrl(url)
  const repoPath = getRepoPathByName(repoName)

  const isExist = existsSync(repoPath) && existsSync(resolve(repoPath, '.git'))
  if (!isExist) {
    rmSync(repoPath, { force: true, recursive: true })

    const git = simpleGit()
    await git.clone(url, repoPath)

    return git
  }

  return selectRepo(repoPath)
}

/** 选择某个仓库，返回 git 对象 */
export async function selectRepo(repoName: string) {
  const repoPath = getRepoPathByName(repoName)
  const git = simpleGit(repoPath)

  return git
}

/** 列出仓库最近提交的数个分支 */
export async function listRecentCommitBranches(git: SimpleGit, count: number) {
  const branches = await git.branch(['-r', '--sort=committerdate'])

  return branches.all
    .reverse()
    .map(item => item.replace('origin/', ''))
    .slice(0, count)
}

/** 列出仓库当前分支最近的数次提交 */
export async function listRecentCommits(git: SimpleGit, branchName: string, days: number) {
  await git.checkout(branchName)
  await git.pull()
  const result = await git.log([`--since=${days}.days`])

  return result.all
}

/** 从仓库 url 中提取仓库名称 */
export function getRepoNameByUrl(repoUrl: string) {
  return repoUrl.match(/\/([a-zA-Z0-9-_]+)\.git/)[1]
}

/** 按仓库名称解析出存储文件路径 */
function getRepoPathByName(repoName: string) {
  const gitRepoRootPath =
    process.env.GIT_REPO_STORAGE_PATH?.replace('~', homedir()) ??
    resolve(homedir(), './.paperplane-api/git-repos')
  const repoPath = resolve(gitRepoRootPath, repoName)

  return repoPath
}
