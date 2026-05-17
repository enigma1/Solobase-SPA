export const timeoutPromise = async <T>(
  timeLimit: number,
  promise?: Promise<T>
): Promise<T | void> => {
  if (!promise) {
    // No promise passed — just delay, don't reject
    return new Promise<void>(resolve => {
      setTimeout(resolve, timeLimit)
    })
  }

  // Race the passed promise against a timeout
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout after ${timeLimit}ms`))
      }, timeLimit)
    })
  ])
}
