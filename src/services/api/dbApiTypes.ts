import {
  DbTable,
  DbTableType,
  DbTableColumns,
  DbTableRow,
  SqlRow,
  Scalar,
  ScalarObject,
  PrimeObject,
  CollectionRow,
  SqlColumns,
  SqlColumnsShape,
} from '>/types';

export type BasicResponse = {
  ok: boolean;
  message: string;
};

export type BasicRowsShape = {
  rows: SqlRow[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
};

export type SessionRestoreResponse = {
  schemas: BasicRowsShape;
  username: string;
  dbSelected: string | null;
  preferences: Record<string, any>;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  username: string;
  schemas: string[];
};

export type RunQueryRequest = {
  query: string;
  database?: string;
};

// export type ServerSessionType = {
//   username: string;
//   dbSelected: string | null;
//   preferences: PrimeObject;
// };

export type DatabaseInfo = {
  name: string;
  charset: string;
  collation: string;
};
// export type FetchDatabasesResponse = {
//   databases: DatabaseInfo[];
// };

export type FetchDatabasesResponse = BasicRowsShape;

export type FetchTablesRequest = {
  database?: string;
};

export type FetchTablesResponse = BasicRowsShape;

export type FetchRowsRequest = {
  table: string;
  offset?: number;
  limit?: number;
  sortBy?: (
    | `${string} ASC`
    | `${string} DESC`
    | `${string} asc`
    | `${string} desc`
  )[];
};

export type FetchRowsResponse = {
  type: DbTableType;
  rows: DbTableRow[];
  cols: DbTableColumns;
  columnsOrder: string[];
};

type ChangedRow = {
  originalRow: DbTableRow; // original row as fetched from the database
  updatedValues: ScalarObject | CollectionRow; // column name with new value
  rowIndex?: number; // optional original row index as it was fetched
};

export type UpdateRowsRequest = {
  dataRows: ChangedRow[]; // All changed rows
  table: string; // Table being edited
  command?: string; // original SQL command
};

export type UpdateRowsResponse = {
  rows: DbTableRow[];
};

export type RunQueryResponse = BasicRowsShape & {
  query: string;
  truncated: boolean;
};

type CharsetMeta = {
  maxlen: number;
  defaultCollation: string;
  collations: string[];
};

export type StorageEngineMeta = {
  name: string;
  isDefault: boolean;
  transactions: boolean;
  xa: boolean;
  savepoints: boolean;
};

export type FetchDatabaseInfoResponse = {
  collationsByCharset: Record<string, CharsetMeta>;
  engines: StorageEngineMeta[];
  defaults: {
    charset: string;
    collation: string;
    engine: string;
  };
};

export type SelectDatabaseRequest = {
  name: string;
};

export type SelectDatabaseResponse = BasicResponse & {
  database?: string;
};

export type CreateDatabaseRequest = {
  name: string;
  charset?: string;
  collation?: string;
};

export type CreateDatabaseResponse = BasicResponse & {
  database?: string;
};

export type EditDatabaseRequest = {
  name: string;
  charset?: string;
  collation?: string;
};

export type EditDatabaseResponse = BasicResponse & {
  database?: string;
};

export type DeleteDatabasesRequest = {
  names: string[];
};

export type DeleteDatabasesResponse = BasicResponse & {
  databases: string[];
};

export type DeleteTablesRequest = {
  database: string;
  tables: string[];
};

export type CreateTableRequest = {
  database: string;
  table: string;
  engine?: string;
  charset?: string;
  collation?: string;
};

export type CreateTableResponse = BasicResponse & {
  database: string;
  table: string;
};

export type EditTableRequest = {
  table: string;
  database: string;
  engine?: string;
  charset?: string;
  collation?: string;
};

export type EditTableResponse = BasicResponse & {
  database: string;
  table: string;
};

export type DeleteTablesResponse = BasicResponse & {
  tables: string[];
};

export type ExportDatabasesRequest = {
  databases: string[];
};

export type ExportDatabasesResponse = BasicResponse & {
  databases: string[];
};
