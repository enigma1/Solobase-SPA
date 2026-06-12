import {
  Scalar,
  ScalarObject,
  SqlRow,
  SqlColumns,
  TableShapeKey,
  TableShapeColumn,
  SqlColumnsShape,
  DataCell,
} from '>/types';

export const MAX_TABLE_COLUMNS = 256;
export const MAX_TABLE_KEYS = 64;
export const MAX_COLUMNS_PER_KEY = 16;

export const MAX_INSERT_DATA_ROWS = 16;

export const tableColumnTypes = [
  {
    id: 'numeric',
    label: 'Numeric',
    meta: { hasUnsigned: true, hasAutoIncrement: true },
    options: [
      { value: 'INT' },
      { value: 'DECIMAL', params: ['Precision', 'Scale'] },
      { value: 'BOOL' },
      { value: 'TINYINT' },
      { value: 'BIGINT' },
      { value: 'FLOAT' },
      { value: 'SMALLINT' },
      { value: 'MEDIUMINT' },
      { value: 'DOUBLE' },
      { value: 'NUMERIC' },
      { value: 'BIT', params: ['Length'] },
      { value: 'BOOLEAN' },
    ],
  },

  {
    id: 'text',
    label: 'Text',
    options: [
      { value: 'VARCHAR', params: ['Length *'] },
      { value: 'TEXT' },
      { value: 'MEDIUMTEXT' },
      { value: 'TINYTEXT' },
      { value: 'LONGTEXT' },
      { value: 'CHAR', params: ['Length *'] },
    ],
  },

  {
    id: 'binary',
    label: 'Binary',
    options: [
      { value: 'BINARY', params: ['Length'] },
      { value: 'VARBINARY', params: ['Length'] },

      { value: 'TINYBLOB' },
      { value: 'BLOB' },
      { value: 'MEDIUMBLOB' },
      { value: 'LONGBLOB' },
    ],
  },

  {
    id: 'datetime',
    label: 'Date & Time',
    options: [
      { value: 'DATE' },
      { value: 'TIME' },
      { value: 'DATETIME' },
      { value: 'TIMESTAMP' },
      { value: 'YEAR' },
    ],
  },

  {
    id: 'enum',
    label: 'Enumeration',
    options: [
      { value: 'ENUM', params: ['Enum'] },
      { value: 'SET', params: ['Set'] },
    ],
  },

  {
    id: 'json',
    label: 'JSON',
    options: [{ value: 'JSON' }],
  },

  {
    id: 'spatial',
    label: 'Spatial',
    options: [
      { value: 'GEOMETRY' },
      { value: 'POINT' },
      { value: 'LINESTRING' },
      { value: 'POLYGON' },

      { value: 'MULTIPOINT' },
      { value: 'MULTILINESTRING' },
      { value: 'MULTIPOLYGON' },

      { value: 'GEOMETRYCOLLECTION' },
    ],
  },
];

export const buildRulesFromColumn = (col: SqlColumns) => {
  const rules: any = {};

  if (col.nullable === 'NO') {
    rules.required = 'Required';
  }

  const type = col.type.toLowerCase();

  if (type.includes('varchar')) {
    const match = type.match(/\((\d+)\)/);
    if (match) rules.maxLength = Number(match[1]);
  }

  if (type.includes('int')) {
    rules.validate = (v: Scalar) =>
      v === null || v === '' || !isNaN(Number(v)) || 'Must be number';
  }

  if (type === 'json') {
    rules.validate = (v: unknown) => {
      try {
        JSON.parse(v as string);
        return true;
      } catch {
        return 'Invalid JSON';
      }
    };
  }

  return rules;
};

const defaultValueForColumn = (column: SqlColumns): DataCell => {
  const type = column.type.toLowerCase();

  if (type === 'json') {
    return {
      editorType: 'json',
      value: column.defaultValue ?? null,
    };
  }

  if (column.defaultValue != null) {
    return {
      editorType: 'input',
      value: column.defaultValue,
    };
  }

  if (type.includes('int')) {
    return { editorType: 'input', value: null };
  }

  if (type.includes('bool')) {
    return { editorType: 'input', value: false };
  }

  if (type.includes('date')) {
    return { editorType: 'input', value: null };
  }

  return {
    editorType: 'input',
    value: '',
  };
};

export const transformColumnsToDefaults = (cols: SqlColumnsShape) => {
  return Object.values(cols).map(defaultValueForColumn);
};

export const emptyDataRow = (cols: SqlColumnsShape) => ({
  uid: crypto.randomUUID(),
  values: transformColumnsToDefaults(cols),
});

export const emptyTableColumn = (): TableShapeColumn => ({
  uid: crypto.randomUUID(),
  field: '',
  type: '',
  params: {},
  nullable: false,
  autoIncrement: false,
  unsigned: false,
  defaultValue: '',
  comment: '',
});

export const emptyTableColumnKey = (): TableShapeKey => ({
  uid: crypto.randomUUID(),
  type: 'INDEX',
  name: '',
  columns: [],
  references: undefined,
});

export const tableColumnKeyList = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'UNIQUE', label: 'Unique' },
  { value: 'INDEX', label: 'Index' },
  { value: 'FOREIGN', label: 'Foreign Key' },
];
// Merge column data given the original row array and edited columns array
// Edited columns will become the update values
// and everything else becomes a "where" condition because is untouched
export const getMergedColumnData = (
  row: SqlRow,
  editedColumns?: ScalarObject,
): SqlRow => {
  if (!editedColumns) return row;

  const mergedData: SqlRow = [...row];
  Object.entries(editedColumns).forEach(([index, value]) => {
    mergedData[Number(index)] = value;
  });
  return mergedData;
};
