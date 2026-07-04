import {
  MutationFunction,
  useMutation,
  useQueryClient,
  MutationFunctionContext,
} from '@tanstack/react-query';

import {
  MutationRequestMeta,
  MutationCallbacks,
  MutationHookProps,
  getMutationResult,
  MutationCacheEffect,
  InferVariables,
  InferData,
} from './defs';

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
    meta?: MutationRequestMeta,
  ) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: fn,
      meta,
      onSuccess: async (data, variables, onMutateResult, context) => {
        await options?.cache?.(queryClient, data, variables);
        await callbacks?.onSuccess?.(data, variables, onMutateResult, context);
      },
      onError: async (error, variables, onMutateResult, context) => {
        await options?.cacheError?.(queryClient, error, variables);
        await callbacks?.onError?.(error, variables, onMutateResult, context);
      },
      // onError: callbacks?.onError,
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
