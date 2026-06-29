export const aStub: readonly unknown[] = [];
export const oStub: Readonly<Record<string, unknown>> = {};
export const fStub = (): void => {};
export const TRUE = true as const;
export const FALSE = false as const;
export const MAX_SQL_STRING = 1024 * 1024;
export const MAX_TEXT_STRING = 1000;

export const MIN_QUERY_CHARS = 4;
export const MAX_TABLE_COLUMNS = 256;
export const MAX_TABLE_KEYS = 64;
export const MAX_COLUMNS_PER_KEY = 16;
export const MAX_INSERT_DATA_ROWS = 16;
