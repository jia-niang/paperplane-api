/**
 * Git 仓库的状态
 * - `"init"` = 初始化
 * - `"ready"` = 空闲状态
 * - `"pending"` = 执行耗时任务中
 * - `"error"` = 出错
 */
type GitRepoStatusType = 'init' | 'ready' | 'pending' | 'error'
