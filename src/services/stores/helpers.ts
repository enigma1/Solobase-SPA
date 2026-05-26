const isUpdaterFn = <T>(v: T | ((prev: T) => T)): v is (prev: T) => T =>
  typeof v === 'function';

const withFieldUpdater = <T>() => ({
  updateField:
    <K extends keyof T>(key: K) =>
    (setAuto: CallableFunction) =>
    (value: T[K] | ((prev: T[K]) => T[K])) =>
      setAuto((state: T) => {
        const next =
          typeof value === 'function'
            ? (value as (prev: T[K]) => T[K])(state[key])
            : value;

        return {
          [key]: next,
        } as unknown as Partial<T>;
      }),
});
