import {
  MutationFunction,
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  MutationCallbacks,
  MutationHookProps,
  getMutationResult,
} from './defs';

type InferData<T> = T extends MutationFunction<infer R, any> ? R : never;
type InferVariables<T> = T extends MutationFunction<any, infer V> ? V : never;

type MutationCacheEffect<TMutationFn extends MutationFunction<any, any>> = {
  cache?: (
    queryClient: QueryClient,
    data: InferData<TMutationFn>,
    variables: InferVariables<TMutationFn>,
  ) => void | Promise<void>;
};

type CreateMutationHookProps<TMutationFn extends MutationFunction<any, any>> = {
  fn: TMutationFn;
  state: InferData<TMutationFn>;
  options?: MutationCacheEffect<TMutationFn>;
};

export const createMutationHook =
  <TMutationFn extends MutationFunction<any, any>>({
    fn,
    state,
    options,
  }: CreateMutationHookProps<TMutationFn>) =>
  <
    TSelected = MutationHookProps<
      InferData<TMutationFn>,
      InferVariables<TMutationFn>
    >,
  >(
    selector?: (
      args: MutationHookProps<
        InferData<TMutationFn>,
        InferVariables<TMutationFn>
      >,
    ) => TSelected,
    callbacks?: MutationCallbacks<
      InferData<TMutationFn>,
      InferVariables<TMutationFn>
    >,
  ) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: fn,
      onSuccess: async (data, variables, onMutateResult, context) => {
        await options?.cache?.(queryClient, data, variables);
        await callbacks?.onSuccess?.(data, variables, onMutateResult, context);
      },
      // onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
    });

    const args: MutationHookProps<
      InferData<TMutationFn>,
      InferVariables<TMutationFn>
    > = {
      ...getMutationResult<InferData<TMutationFn>, InferVariables<TMutationFn>>(
        mutation,
      ),

      state: mutation.data ?? state,
    };

    return selector ? selector(args) : (args as TSelected);
  };
