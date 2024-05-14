import { omit } from 'lodash'

const removeField = ['id', 'createdAt', 'updatedAt', 'deletedAt'] as const

/** 同 `_.omit()` 但是会自动移除掉数据库特殊字段 */
export function omitDB<T extends object, K extends keyof T>(object: T, fields: K[] = []) {
  return omit(object, [...fields, ...removeField])
}
