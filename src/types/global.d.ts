declare namespace NodeJS {
  interface ProcessEnv {
    /** 运行环境，请使用 `production` 来判断 */
    readonly NODE_ENV: 'development' | 'production'
    /** 本机地址 */
    readonly HOST: string
  }
}

interface IResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
}

interface IError<T> extends IResponse<T> {
  success: false
}

/** 带有 _id 的类型 */
interface WithId<T> extends T {
  _id: string
}

/** 带有 _id 的接口 */
interface IWithId {
  _id: IdType
}

/** 自类型中移除 _id 类型 */
type NoId<T extends IWithId> = Omit<T, keyof IWithId>

/** 获取数组的类型 */
type TypeofArray<T extends any[]> = T extends (infer U)[] ? U : never
