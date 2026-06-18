export type Scalar = Date | bigint | boolean | null | number | string;
export type ScalarObject = Record<string, Scalar>;
export type PrimeRow = Scalar[];

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
  uiKey: string;
};
