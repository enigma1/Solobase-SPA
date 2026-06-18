import {
  TableDataType,
  TableDataColumns,
  TableDataRow,
  SqlRow,
  Scalar,
  ScalarObject,
  PrimeObject,
  CollectionRow,
  SqlColumns,
  SqlColumnsShape,
  TableShapeKey,
  TableShapeColumn,
  TableShape,
  TableData,
  TableBasics,
  GroupByModes,
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

export type SessionRestoreResponse = BasicResponse & {
  schemas: BasicRowsShape;
  username: string;
  dbSelected: string | null;
  preferences: Record<string, any>;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = BasicResponse & {
  success: boolean;
  username: string;
  schemas: string[];
};

export type RunQueryRequest = {
  query: string;
  database?: string;
};

export type RunRawQueryRequest = {
  query: string;
  database?: string;
  groupByMode?: GroupByModes;
};

type ResultSetResponse = BasicResponse & {
  mode: 'resultset';
  rows: Scalar[][];
  columnsOrder: string[];
  cols: SqlColumnsShape;
};

type CommandResponse = BasicResponse & {
  mode: 'command';
  resultInfo: {
    affectedRows: number;
  };
};
export type RunRawQueryResponse = ResultSetResponse | CommandResponse;

export type FetchDatabasesResponse = BasicResponse & BasicRowsShape;

export type FetchTablesRequest = {
  database?: string;
};

export type FetchTablesResponse = BasicResponse & BasicRowsShape;

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

export type FetchRowsResponse = BasicResponse & TableData;
export type CreateDataRowsRequest = BasicRowsShape & {
  database: string;
  table: string;
};

export type CreateDataRowsResponse = BasicResponse & BasicRowsShape;

type ChangedRow = {
  originalRow: TableDataRow; // original row as fetched from the database
  updatedValues: ScalarObject | CollectionRow; // column name with new value
  rowIndex?: number; // optional original row index as it was fetched
};

export type UpdateDataRowsRequest = {
  dataRows: ChangedRow[]; // All changed rows
  table: string; // Table being edited
  command?: string; // original SQL command
};

export type UpdateDataRowsResponse = BasicResponse & {
  rows: TableDataRow[];
};

export type DeleteDataRowsRequest = {
  database: string;
  table: string; // Table being edited
  rows: SqlRow[];
};
export type DeleteDataRowsResponse = BasicResponse & {
  rows: TableDataRow[];
};

// export type InsertDataRowsRequest = {
//   dataRows: ChangedRow[]; // All changed rows
//   table: string; // Table being edited
//   rows: SqlRow[];
// };
// export type InsertDataRowsResponse = BasicResponse & {
//   rows: TableDataRow[];
// };

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

export type FetchDatabaseInfoResponse = BasicResponse & {
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

export type CreateTableRequest = TableShape;
export type CreateTableResponse = BasicResponse & {
  database: string;
  table: string;
};

export type EditTableRequest = {
  original: TableShape;
  modified: TableShape;
};

export type EditTableResponse = BasicResponse & TableBasics;

export type DeleteTablesResponse = BasicResponse & {
  tables: string[];
};

export type ExportDatabasesRequest = {
  databases: string[];
};

export type ExportDatabasesResponse = BasicResponse & {
  databases: string[];
};

export type GetTableDetailsRequest = TableBasics;
// Make engine, charset, collation required for this type
export type GetTableDetailsResponse = BasicResponse &
  TableShape & {
    engine: string;
    charset: string;
    collation: string;
  };

export type GetTableColumnsInfoRequest = TableBasics;
export type GetTableColumnsInfoResponse = BasicResponse &
  TableBasics &
  BasicRowsShape;
