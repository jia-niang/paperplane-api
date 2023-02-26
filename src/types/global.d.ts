interface IResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
}

interface IError<T> extends IResponse<T> {
  success: false
}

interface IWithId<T> extends T {
  id: string
}
