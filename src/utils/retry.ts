export interface IRetryOption {
  retries?: number
}

const defaultRetryOptions: IRetryOption = {
  retries: 3,
}

export async function retry<TFnResult = any>(
  fn: (...p: any[]) => Promise<TFnResult>,
  options?: IRetryOption
): Promise<TFnResult> {
  const { retries } = { ...defaultRetryOptions, ...options }

  let attempts = 0

  while (attempts < retries) {
    try {
      return await fn()
    } catch (error) {
      attempts += 1
      if (attempts >= retries) {
        throw error
      }
    }
  }
}
