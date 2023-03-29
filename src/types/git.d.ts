/**
 * Git 仓库的状态
 * - `"ready"` = 空闲状态
 * - `"cloning"` = 初次克隆中，此时仓库不可使用
 * - `"pending"` = 执行耗时任务中
 * - `"error"` = 出错
 */
type GitRepoStatusType = 'ready' | 'cloning' | 'pending' | 'error'
