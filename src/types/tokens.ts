export type CSSVar = `var(--${string})`;
export type CSSVarOrNestedObject =
  | { [key: string]: CSSVarOrNestedObject }
  | string;

export type TokenParams<T extends string, S = CSSVar> = { [K in T]: S };
export type DeepValue<T, S = CSSVarOrNestedObject> =
  T extends Record<string, unknown>
    ? { [K in keyof T]: DeepValue<T[K], S> }
    : S;
export type WidenTokens<T> =
  T extends Record<string, unknown>
    ? { [K in keyof T]: WidenTokens<T[K]> }
    : CSSVar;
