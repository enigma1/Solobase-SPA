import { JSONObject } from 'type-plus';
import { PrimeObject } from './common';
const DB_TABLE_TYPE = ['table', 'collection'] as const;
// export type DbTableType = 'table' | 'collection';
export type DbTableType = (typeof DB_TABLE_TYPE)[number];

export type DbTable = {
  name: string;
  rows?: number;
  cols?: PrimeObject;
  engine?: string;
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

export type Scalar = Date | bigint | boolean | null | number | string;
export type ScalarObject = Record<string, Scalar>;

export type CollectionRow = { _id: string } & PrimeObject<JSONObject>;
// export type SqlRow = {
//   __rowId: string;
// } & ScalarObject;

export type SqlRow = Scalar[];
export type SqlColumnsShape = Record<string, SqlColumns>;
export type DbTableRow = CollectionRow | SqlRow;
export type DbTableColumns = CollectionColumns | SqlColumnsShape;

export type DbTableData = {
  rows: DbTableRow[];
  cols: DbTableColumns;
  type: DbTableType;
  columnsOrder: string[];
};
export type DbQueryData = {
  rows: DbTableRow[];
  cols: DbTableColumns;
  columnsOrder: string[];
};
