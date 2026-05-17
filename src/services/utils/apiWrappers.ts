import { Handlers } from '>/utils/handlers';

export const mountApi = <TApi extends Record<string, (arg?: any) => unknown>>(
  apiList: TApi,
) => {
  return <N extends keyof TApi>(
    name: N,
    args?: Parameters<TApi[N]>[0],
    handlers?: Handlers<Awaited<ReturnType<TApi[N]>>>,
  ): Promise<Awaited<ReturnType<TApi[N]>>> => {
    const resolver = apiList[name](args) as Promise<
      Awaited<ReturnType<TApi[N]>>
    >;
    if (handlers) {
      resolver
        .then(handlers.onSuccess)
        .catch(handlers.onFailure ?? console.error);
    }
    return resolver; // always return promise
  };
};
