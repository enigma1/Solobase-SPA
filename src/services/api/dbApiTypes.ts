import {
  DbTable,
  DbTableType,
  DbTableColumns,
  DbTableRow,
  SqlRow,
  ScalarObject,
  PrimeObject,
  CollectionRow,
  SqlColumns,
  SqlColumnsShape,
} from '>/types';

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

export type ServerSessionType = {
  username: string;
  dbSelected: string | null;
  preferences: PrimeObject;
};

export type FetchDatabasesResponse = {
  databases: string[];
};

export type FetchTablesRequest = {
  database: string;
};

export type FetchTablesResponse = {
  tables: Record<string, DbTable>;
};

export type FetchRowsRequest = {
  offset?: number;
  limit?: number;
  table: string;
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

export type RunQueryResponse = {
  rows: SqlRow[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  query: string;
  truncated: boolean;
};

export type CharsetMeta = {
  maxlen: number;
  defaultCollation: string;
  collations: string[];
};

export type FetchDatabaseInfoResponse = {
  collationsByCharset: Record<string, CharsetMeta>;
  defaults: {
    charset: string;
    collation: string;
  };
};

export type CreateDatabaseRequest = {
  name: string;
  charset: string;
  collation: string;
};

export type CreateDatabaseResponse = {
  success: boolean;
  database?: string;
  message: string;
};

export type DeleteDatabaseRequest = {
  name: string;
};

export type DeleteDatabaseResponse = {
  success: boolean;
  database?: string;
  message: string;
};
