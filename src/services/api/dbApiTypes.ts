import {
  SqlTypes,
  SqlObject,
  SqlRow,
  TokenRow,
  BasicRowsShape,
  PrimeObject,
  SqlColumns,
  SqlColumnsShape,
  TableShapeKey,
  TableShapeColumn,
  TableShape,
  TableBasics,
  SqlQueryModes,
  UserCapabilities,
  UserShape,
} from '>/types';

export type ApiOptions = {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};
export type ApiFunction<TData = void, TResponse = any> = (
  data?: TData,
  options?: ApiOptions,
) => Promise<TResponse>;

export type BasicResponse = {
  ok: boolean;
  message: string;
  route: string;
  queries: string[];
};

export type AuthResponse<TData = BasicResponse> = {
  data: TData;
};
export type CleanupResponse = AuthResponse;

export type AbortResponse = BasicResponse;

export type SessionRestoreResponse = BasicResponse & {
  username: string;
  dbSelected: string | null;
  preferences: Record<string, any>;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = BasicResponse & {
  preferences: Record<string, any>;
  capabilities: string[];
};

export type RunQueryRequest = {
  query: string;
  database?: string;
};

export type RunRawQueryRequest = {
  query: string;
  database?: string;
  groupByMode?: SqlQueryModes;
};

type ResultSetResponse = BasicResponse &
  BasicRowsShape & {
    mode: 'resultset';
  };

type CommandResponse = BasicResponse & {
  mode: 'command';
  resultInfo: {
    affectedRows: number;
  };
};

export type RunRawQueryResponse = ResultSetResponse | CommandResponse;

type SortBy = {
  column: string;
  direction: 'ASC' | 'DESC';
};

export type SortRequest = {
  sortBy?: SortBy[];
};

export type PagingRequest = {
  paging?: {
    offset: number;
    limit: number;
  };
};

export type PagingResponse = {
  paging?: {
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export type BasicDataRequest = SortRequest & PagingRequest;
export type BasicDataResponse = BasicResponse & BasicRowsShape & PagingResponse;

export type FetchUsersRequest = BasicDataRequest;
export type FetchUsersResponse = BasicDataResponse;

export type FetchDatabasesRequest = BasicDataRequest;
export type FetchDatabasesResponse = BasicDataResponse;

export type FetchTablesRequest = BasicDataRequest & {
  database?: string;
};
export type FetchTablesResponse = BasicDataResponse;

export type FetchRowsRequest = TableBasics & BasicDataRequest;
export type FetchRowsResponse = BasicDataResponse;

export type CreateDataRowsRequest = BasicRowsShape & {
  database: string;
  table: string;
};

export type CreateDataRowsResponse = BasicResponse & TableBasics;

type ChangedRow = {
  originalRow: SqlRow; // original row as fetched from the database
  updatedValues: SqlObject; // column name with new value
  rowToken?: TokenRow;
};

export type UpdateDataRowsRequest = TableBasics & {
  dataRows: ChangedRow[]; // All changed rows
  command?: string; // original SQL command
};

export type UpdateDataRowsResponse = BasicResponse &
  TableBasics & {
    rows: SqlRow[];
  };

export type DeletedRow = {
  originalRow: SqlRow; // original row as fetched from the database
  rowToken?: TokenRow;
};

export type DeleteDataRowsRequest = TableBasics & {
  dataRows: DeletedRow[]; // All changed rows
};
export type DeleteDataRowsResponse = BasicResponse &
  TableBasics & {
    rows: SqlRow[];
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

export type CreateUserRequest = UserShape;
export type CreateUserResponse = BasicResponse & {};

export type EditUserRequest = {
  username: string;
  password: string;
  host: string;
};
export type EditUserResponse = BasicResponse & {};

export type FetchDatabaseInfoResponse = BasicResponse & {
  collationsByCharset: Record<string, CharsetMeta>;
  engines: StorageEngineMeta[];
  defaults: {
    charset: string;
    collation: string;
    engine: string;
  };
};

export type DeleteUsersRequest = {
  rows: SqlRow[];
  columnsOrder: string[];
};
export type DeleteUsersResponse = BasicResponse & {
  rows: SqlRow[];
  columnsOrder: string[];
};

export type SelectDatabaseRequest = {
  database: string;
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
export type CreateTableResponse = BasicResponse & TableBasics;

export type EditTableRequest = {
  original: TableShape;
  modified: TableShape;
};

export type EditTableResponse = BasicResponse & TableBasics;

export type DeleteTablesResponse = BasicResponse & {
  database: string;
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
export type GetTableColumnsInfoResponse = BasicDataResponse & TableBasics;

export type ImportDataRequest = {
  database?: string;
  data: string;
  groupByMode?: SqlQueryModes;
};

export type ImportDataResponse = BasicResponse;
