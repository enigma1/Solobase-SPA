export type PrimeObject<
  T = any,
  K extends string | number | symbol = string,
> = T extends any[] | Function
  ? never
  : T extends object
    ? Record<K, T>
    : never;

export type ViewRow<T> = {
  row: T;
  uiKey: number;
};
