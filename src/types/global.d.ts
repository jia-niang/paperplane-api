interface IResponse<T> {
  code: number
  message: string
  data: T
}

interface IError<T> extends IResponse<T> {}
