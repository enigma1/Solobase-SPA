import { JSONObject } from 'type-plus';
import { PrimeObject } from './common';

export type DataEditorType =
  | 'input'
  | 'textarea'
  | 'json'
  | 'boolean'
  | 'selection';
export type DataCell = {
  value: Scalar;
  editorType: DataEditorType;
};

const DB_TABLE_TYPE = ['table', 'collection'] as const;
export type TableDataType = (typeof DB_TABLE_TYPE)[number];

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
export type SqlRow = Scalar[];
export type SqlColumnsShape = Record<string, SqlColumns>;
export type TableDataRow = CollectionRow | SqlRow;
export type TableDataColumns = CollectionColumns | SqlColumnsShape;

export type BaseTableData = {
  rows: TableDataRow[];
  cols: TableDataColumns;
  columnsOrder: string[];
};

export type TableData = BaseTableData & {
  type: TableDataType;
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
