declare namespace NodeJS {
  interface ProcessEnv {
    /** 运行环境，请使用 `production` 来判断 */
    readonly NODE_ENV: 'development' | 'production'
  }
}

interface IResponse<T> {
  success: boolean
  code: number
  data: T
}

interface IError<T = undefined> extends IResponse<T> {
  success: false
  message: string
}

/** 获取数组的类型 */
type TypeofArray<T extends any[]> = T extends (infer U)[] ? U : never
