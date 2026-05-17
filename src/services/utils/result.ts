export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error }

export const result = (() => {
  const withOk = <T>(data: T): Result<T> => ({ success: true, data })
  const withFail = <T = never>(error: Error): Result<T> => ({
    success: false,
    error
  })
  const withResult = async <T>(
    fn: () => Promise<T> | T
  ): Promise<Result<T>> => {
    try {
      const data = await fn()
      return withOk(data)
    } catch (e) {
      return withFail(e as Error)
    }
  }
  return {
    withOk,
    withFail,
    withResult
  }
})()
