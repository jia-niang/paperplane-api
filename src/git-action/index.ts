import { generateKeyPairSync } from 'crypto'
import { chmodSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'
import simpleGit, { SimpleGit } from 'simple-git'
import sshPK from 'sshpk'

/** 克隆新仓库或同步现存仓库 */
export async function cloneOrSyncRepo(url: string, projectId: string) {
  const repoName = getRepoNameByUrl(url)
  const repoPath = getRepoPathByName(repoName)

  const privateKeyFilePath = getRepoPathByName(projectId) + '_rsa'

  const isExist = existsSync(repoPath) && existsSync(resolve(repoPath, '.git'))
  if (!isExist) {
    rmSync(repoPath, { force: true, recursive: true })
    await simpleGit()
      .env(
        'GIT_SSH_COMMAND',
        `ssh -i ${privateKeyFilePath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`
      )
      .clone(url, repoPath)
  }

  return simpleGit(repoPath).env(
    'GIT_SSH_COMMAND',
    `ssh -i ${privateKeyFilePath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`
  )
}

/** 选择某个仓库，返回 git 对象 */
export async function selectRepoGit(repoName: string, projectId: string) {
  const repoPath = getRepoPathByName(repoName)
  const privateKeyFilePath = getRepoPathByName(projectId) + '_rsa'

  const git = simpleGit(repoPath).env(
    'GIT_SSH_COMMAND',
    `ssh -i ${privateKeyFilePath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`
  )

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

/** 删除仓库和文件 */
export async function deleteRepo(repoName: string) {
  const repoPath = getRepoPathByName(repoName)
  rmSync(repoPath, { force: true, recursive: true })
}

/** 生成 RSA 密钥对 */
export function generateAndWriteRSAKeyPair(projectId: string): {
  privateKey: string
  publicKey: string
} {
  const keyPair = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  keyPair.publicKey = sshPK
    .parseKey(keyPair.publicKey, 'pem')
    .toString('ssh')
    .replace('(unnamed)', projectId)

  writeFileSync(getRepoPathByName(projectId) + '_rsa', keyPair.privateKey, { flag: 'w+' })
  chmodSync(getRepoPathByName(projectId) + '_rsa', '600')

  return keyPair
}

/** 从仓库 url 中提取仓库名称 */
export function getRepoNameByUrl(repoUrl: string) {
  return repoUrl.match(/\/([a-zA-Z0-9-_]+)\.git/)[1]
}

/** 准备 Git 仓库暂存目录 */
export function prepareGitRepoPath() {
  mkdirSync(getRepoPathByName(), { recursive: true })
}

/** 按仓库名称解析出存储文件路径 */
function getRepoPathByName(repoName?: string) {
  const gitRepoRootPath =
    process.env.GIT_REPO_STORAGE_PATH?.replace('~', homedir()) ??
    resolve(homedir(), './.paperplane-api/git-repos')

  const repoPath = repoName ? resolve(gitRepoRootPath, repoName) : gitRepoRootPath

  return repoPath
}
