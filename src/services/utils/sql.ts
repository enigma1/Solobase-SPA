import {
  ScalarObject,
  SqlRow,
  SqlColumns,
  TableShapeKey,
  TableShapeColumn,
} from '>/types';

export const MAX_TABLE_COLUMNS = 256;
export const MAX_TABLE_KEYS = 64;
export const MAX_COLUMNS_PER_KEY = 16;

export const tableColumnTypes = [
  {
    id: 'numeric',
    label: 'Numeric',
    options: [
      { value: 'BIT', params: ['Length'] },
      { value: 'BOOL' },
      { value: 'BOOLEAN' },

      { value: 'TINYINT' },
      { value: 'SMALLINT' },
      { value: 'MEDIUMINT' },
      { value: 'INT' },
      { value: 'BIGINT' },

      { value: 'DECIMAL', params: ['Precision', 'Scale'] },
      { value: 'NUMERIC' },

      { value: 'FLOAT' },
      { value: 'DOUBLE' },
    ],
  },

  {
    id: 'text',
    label: 'Text',
    options: [
      { value: 'CHAR', params: ['Length *'] },
      { value: 'VARCHAR', params: ['Length *'] },

      { value: 'TINYTEXT' },
      { value: 'TEXT' },
      { value: 'MEDIUMTEXT' },
      { value: 'LONGTEXT' },
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

export const emptyTableColumn = (): TableShapeColumn => ({
  uid: crypto.randomUUID(),
  field: '',
  type: '',
  params: {},
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
