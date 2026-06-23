import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccountStore } from '>/services/stores';
import { DataHookProps, STALE_TIME, QueryHookOptions } from './defs';

// export const createDataQueryHook =
//   <TData, TVariables = void, TApi extends object = {}>(
//     options: QueryHookOptions<TData, TVariables, TApi>,
//   ) =>
//   <TSelected = DataHookProps<TData, TApi>>(
//     selector: (args: DataHookProps<TData, TApi>) => TSelected,
//     variables: TVariables,
//   ) => {
//     const isAuthenticated = useAccountStore(
//       ({ state }) => state.isAuthenticated,
//     );
//     const q = useQuery({
//       queryKey: options.queryKey,
//       queryFn: async () => await options.queryFn(),
//       staleTime: STALE_TIME,
//       retry: 1,
//       refetchOnWindowFocus: false,
//       enabled:
//         isAuthenticated &&
//         (options.enabled ? options.enabled(variables) : true),
//     });

//     const state = q.data ?? options.initialData;
//     const api = useMemo(
//       () => options.createApi?.(state) ?? ({} as TApi),
//       [state],
//     );

//     const args = {
//       api,
//       state,
//       query: q,
//     };

//     return selector ? selector(args) : (args as TSelected);
//   };
