import { useMutation } from '@tanstack/react-query';
import type { MutationFunction } from '@tanstack/react-query';

import {
  MutationCallbacks,
  MutationHookProps,
  getMutationResult,
} from './defs';

type InferData<T> = T extends MutationFunction<infer R, any> ? R : never;

type InferVariables<T> = T extends MutationFunction<any, infer V> ? V : never;

export const createMutationHook =
  <TMutationFn extends MutationFunction<any, any>>(
    mutationFn: TMutationFn,
    defaultState: InferData<TMutationFn>,
  ) =>
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
    const mutation = useMutation({
      mutationFn,
      onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
    });

    const args: MutationHookProps<
      InferData<TMutationFn>,
      InferVariables<TMutationFn>
    > = {
      ...getMutationResult<InferData<TMutationFn>, InferVariables<TMutationFn>>(
        mutation,
      ),

      state: mutation.data ?? defaultState,
    };

    return selector ? selector(args) : (args as TSelected);
  };
