import { JSONObject } from 'type-plus';
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

export type DataEditorType =
  | 'input'
  | 'number'
  | 'textarea'
  | 'json'
  | 'boolean'
  | 'selection';
export type DataCell = {
  value: Scalar;
  editorType: DataEditorType;
};

export type SqlColumns = {
  field: string;
  type: string;
  nullable: 'YES' | 'NO';
  key: 'PRI' | 'UNI' | 'MUL' | '';
  defaultValue: string | null;
  extra: string;
};

export type CollectionColumns = {
  _id: string;
  doc: JSONObject;
};

export type CollectionRow = { _id: string } & PrimeObject<JSONObject>;
export type SqlRow = Scalar[];
export type SqlColumnsShape = Record<string, SqlColumns>;
export type TableDataRow = CollectionRow | SqlRow;
export type TableDataColumns = CollectionColumns | SqlColumnsShape;

export type BaseTableData = {
  rows: TableDataRow[];
  cols: TableDataColumns;
  columnsOrder: string[];
};

export type SqlTableData = {
  rows: SqlRow[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
};

const DB_TABLE_TYPE = ['table', 'collection'] as const;
export type TableData = BaseTableData & {
  type: (typeof DB_TABLE_TYPE)[number];
};

export type DatabaseShape = {
  name: string;
  charset?: string;
  collation?: string;
};

export type TableBasics = {
  database: string;
  table: string;
};

export type TableShapeBasics = TableBasics & {
  engine?: string;
  charset?: string;
  collation?: string;
};

export type TableShapeKey = {
  uid: string;
  type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FOREIGN';
  name?: string;
  columns: string[];

  // only if FOREIGN
  references?: {
    table: string;
    columns: string[];
  };
};

export type TableShapeColumn = {
  signature?: string;
  uid: string;
  field: string;
  type: string;
  params?: Record<string, string | number>;
  nullable?: boolean;
  defaultValue?: string | null;
  autoIncrement?: boolean;
  unsigned?: boolean;
  comment?: string;
};
export type TableShape = TableShapeBasics & {
  keys: TableShapeKey[];
  cols: TableShapeColumn[];
};

export type SqlQueryModes = 'default' | 'legacy' | 'strict';
export type ViewRow<T> = {
  row: T;
  uiKey: string;
};

export type UserCapabilities = {
  canGrantPrivileges: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canCreateDatabases: boolean;
  canManageTables: boolean;
  canEditData: boolean;
};

export type UserProfile = 'admin' | 'editor' | 'readOnly';
export type UserShape = {
  user: string;
  host: string;
  password: string;
  profile?: UserProfile;
};

export type QueryLogEntry = {
  sql: string;
  params?: unknown;
  connector: 'sql' | 'xdevapi' | 'stream';
  startedAt: number;
  durationMs: number;
};
