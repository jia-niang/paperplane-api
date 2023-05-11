import { generateKeyPairSync } from 'crypto'
import { chmodSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'
import simpleGit, { SimpleGit } from 'simple-git'
import sshPK from 'sshpk'

/** 克隆新仓库或同步现存仓库 */
export async function cloneOrSyncRepo(options: {
  url: string
  projectId: string
  repoId: string
  privateKey?: string
}) {
  const { url, privateKey, projectId, repoId } = options

  const repoPath = getRepoPathById(repoId)
  const privateKeyFilePath = preparePrivateKeyFile({ projectId, privateKeyValue: privateKey })

  const isExist = existsSync(repoPath) && existsSync(resolve(repoPath, '.git'))
  if (!isExist) {
    rmSync(repoPath, { force: true, recursive: true })

    const tempGit = await createGit({ privateKeyFilePath })
    await tempGit.clone(url, repoPath)
  }

  const git = await createGit({ repoPath, privateKeyFilePath })
  await git.addConfig('pull.rebase', 'false', true, 'local')
  await git.fetch(['--prune'])

  return git
}

/** 选择某个仓库，返回 git 对象 */
export async function selectRepoGit(repoName: string, projectId: string, privateKey?: string) {
  const repoPath = getRepoPathById(repoName)
  const privateKeyFilePath = preparePrivateKeyFile({ projectId, privateKeyValue: privateKey })

  return await createGit({ repoPath, privateKeyFilePath })
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
  const currentBranchName = await git.checkout()
  await git.checkout(branchName)
  await git.pull()
  const result = await git.log([`--since=${days}.days`])
  await git.checkout(currentBranchName)

  return result.all
}

/** 删除仓库和文件 */
export async function deleteRepo(repoId: string) {
  const repoPath = getRepoPathById(repoId)
  rmSync(repoPath, { force: true, recursive: true })
  rmSync(repoPath + '_rsa', { force: true, recursive: true })
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

  preparePrivateKeyFile({ projectId, privateKeyValue: keyPair.privateKey })

  return keyPair
}

/** 从仓库 url 中提取仓库名称 */
export function getRepoNameByUrl(repoUrl: string) {
  return repoUrl.match(/\/([a-zA-Z0-9-_]+)\.git/)[1]
}

/** 准备 Git 仓库暂存目录 */
export function prepareGitRepoPath() {
  mkdirSync(getRepoPathById(), { recursive: true })
}

/** 按仓库 ID 解析出存储文件路径 */
function getRepoPathById(repoId?: string) {
  const gitRepoRootPath =
    process.env.GIT_REPO_STORAGE_PATH?.replace('~', homedir()) ??
    resolve(homedir(), './.paperplane-api/git-repos')

  const repoPath = repoId ? resolve(gitRepoRootPath, repoId) : gitRepoRootPath

  return repoPath
}

/** 确保 SSH Key 已存在 */
function preparePrivateKeyFile(options: { projectId?: string; privateKeyValue?: string }) {
  const { projectId, privateKeyValue } = options

  const repoPath = getRepoPathById(projectId)
  const sshKeyPath = repoPath + '_rsa'

  if (!existsSync(sshKeyPath)) {
    writeFileSync(sshKeyPath, privateKeyValue, { flag: 'w+' })
    chmodSync(sshKeyPath, '600')
  }

  return sshKeyPath
}

/** 创建 Git 对象 */
async function createGit(options: { repoPath?: string; privateKeyFilePath?: string }) {
  const { repoPath, privateKeyFilePath } = options

  const git = await simpleGit(repoPath).env(
    'GIT_SSH_COMMAND',
    `ssh -i ${privateKeyFilePath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`
  )

  return git
}
