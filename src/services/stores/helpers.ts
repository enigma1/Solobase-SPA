import { QueryLogEntry } from '>/types';

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

export const collapseSequentialQueryDuplicates = (queries: QueryLogEntry[]) => {
  if (queries.length <= 1) {
    return queries;
  }

  const result = [queries[0]];

  for (let i = 1; i < queries.length; i++) {
    if (queries[i].sql !== queries[i - 1].sql) {
      result.push(queries[i]);
    }
  }

  return result;
};
