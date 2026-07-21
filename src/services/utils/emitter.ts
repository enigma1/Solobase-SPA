import { useSyncExternalStore, useRef } from 'react';
import { comparisonTypes, EqualityFn } from './comparisons';
type StateCreator<T> = (
  set: (updater: (prev: T) => T) => void,
  get: () => T,
) => T;
type Selector<T, U> = (state: T) => U;
type Listener<T> = (state: T) => void;
type SetFn<T> = (
  updater: (prev: T) => T,
  wait?: boolean,
  caller?: string,
) => void | Promise<T>;

// type UseStore<T> = {
//   (): T;
//   <U>(selector: Selector<T, U>, equalityFn?: EqualityFn<U>): U;
// };

const createEmitter = <T>() => {
  const subscriptions = new Map<symbol, Listener<T>>();
  return {
    emit: (value: T) => subscriptions.forEach((fn) => fn(value)),
    subscribe: (fn: Listener<T>) => {
      const key = Symbol();
      subscriptions.set(key, fn);
      // Cleanup function for dismounts etc
      return () => subscriptions.delete(key);
    },
  };
};

export type SetStoreOptions = {
  equalityKey: keyof typeof comparisonTypes;
  wait: boolean;
  sustain: boolean;
  caller: string;
};

export const makeStore = <T extends object>(init: StateCreator<T>) => {
  const emitter = createEmitter<T>();
  let store: T;
  let batchDepth = 0;
  let pendingEmit = false;

  const batch = (fn: () => void) => {
    batchDepth++;

    try {
      fn();
    } finally {
      batchDepth--;

      if (batchDepth === 0 && pendingEmit) {
        pendingEmit = false;
        emitter.emit(store);
      }
    }
  };

  const get = () => store;

  const set = (
    updater: (prev: T) => T,
    options: Partial<SetStoreOptions> = {},
  ): void | Promise<T> => {
    const { wait = false, caller = 'unknown' } = options;

    const next = updater(store);

    if (next !== store) {
      store = next;

      if (batchDepth > 0) {
        pendingEmit = true;
      } else {
        emitter.emit(store);
      }
    }

    if (wait) {
      return Promise.resolve(store);
    }
  };

  const setAuto = (
    updater: Partial<T> | ((prev: T) => Partial<T>),
    options: Partial<SetStoreOptions> = {},
  ): void | Promise<T> => {
    const {
      equalityKey = 'objectIs',
      wait = false,
      caller = 'unknown',
    } = options;
    const current = get();
    const partial = typeof updater === 'function' ? updater(current) : updater;
    const nextState = { ...current, ...partial };
    const isSame = comparisonTypes[equalityKey];

    if (!isSame(nextState, current)) {
      return set(() => nextState, { wait, caller });
    }

    if (wait) {
      return Promise.resolve(current);
    }
  };

  // initialize once
  store = init(set, get);

  const getEqualityFn = <U>(
    equality?: keyof typeof comparisonTypes | EqualityFn<U>,
  ): EqualityFn<U> =>
    typeof equality === 'function'
      ? equality
      : ((comparisonTypes?.[equality ?? 'objectIs'] ??
          Object.is) as EqualityFn<U>);

  const useStore = <U = T>(
    selector?: Selector<T, U>,
    equality?: keyof typeof comparisonTypes | EqualityFn<U>,
  ): U => {
    if (!selector) {
      return useSyncExternalStore(
        emitter.subscribe,
        get, // return client-side stable reference
        get, // return ssr ref
      ) as unknown as U;
    }

    const isSame = getEqualityFn<U>(equality);
    const prevRef = useRef<U>(selector(get()));

    const getSnapshot = () => {
      const nextSelected = selector(get());
      if (!isSame(prevRef.current, nextSelected)) {
        prevRef.current = nextSelected;
      }
      return prevRef.current;
    };

    const subscribe = (callback: () => void) =>
      emitter.subscribe((nextState) => {
        const nextSelected = selector(nextState);
        if (!isSame(prevRef.current, nextSelected)) {
          prevRef.current = nextSelected;
          callback();
        }
      });

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };

  // Attach getters/setters to the hook itself
  useStore.get = get;
  useStore.set = set;
  useStore.setAuto = setAuto;
  useStore.batch = batch;

  // Return function/object structure
  return useStore as typeof useStore & {
    get: typeof get;
    set: typeof set;
    setAuto: typeof setAuto;
    batch: typeof batch;
  };
};

// Factory pattern for SSR support
export const makeFactoryStore = <T extends object>(init: StateCreator<T>) => {
  return () => makeStore(init);
};
