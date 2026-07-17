import { v4 as uuidv4 } from 'uuid';
import {
  SqlTypes,
  SqlObject,
  SqlRow,
  SqlColumns,
  TableShapeKey,
  TableShapeColumn,
  SqlColumnsShape,
  DataCell,
  SqlQueryModes,
} from '>/types';

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
      { value: 'BINARY', params: ['Length *'] },
      { value: 'VARBINARY', params: ['Length *'] },

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

export const flatColumnTypeSet = new Set(
  tableColumnTypes.flatMap((group) =>
    group.options.map((option) => option.value.toUpperCase()),
  ),
);

const getVarcharLength = (type: string) => {
  const match = type.match(/varchar\((\d+)\)/i);
  return match ? Number(match[1]) : null;
};

const getVarbinLength = (type: string) => {
  const match = type.match(/varbinary\((\d+)\)/i);
  return match ? Number(match[1]) : null;
};

const isTextarea = (type: string) => {
  if (type.includes('text')) return true;

  const len = getVarcharLength(type);
  if (len && len > 255) return true; // or 128/255 threshold depending on UX

  return false;
};

const isInteger = (type: string) =>
  /(^|[^a-z])int|bigint|smallint|tinyint/i.test(type);
const isBoolean = (type: string) => /bool|boolean/i.test(type);
const isDate = (type: string) => /date|datetime|timestamp/i.test(type);

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

  if (type.includes('varbinary')) {
    const match = type.match(/\((\d+)\)/);
    if (match) rules.maxLength = Number(match[1]);
  }

  if (type.includes('int')) {
    rules.validate = (v: SqlTypes) =>
      v === null || v === '' || !isNaN(Number(v)) || 'Must be number';
  }

  if (type === 'json') {
    // rules.validate = (v: unknown) => {
    //   try {
    //     JSON.parse(v as string);
    //     return true;
    //   } catch {
    //     console.log('invalid is what', v);
    //     return 'Invalid JSON';
    //   }
    // };
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

  if (isTextarea(type)) {
    return {
      editorType: 'textarea',
      value: column.defaultValue === null ? '' : column.defaultValue,
    };
  }

  if (isInteger(type)) {
    return { editorType: 'number', value: null };
  }

  if (isBoolean(type)) {
    return { editorType: 'input', value: false };
  }

  if (isDate(type)) {
    return { editorType: 'input', value: null };
  }

  return {
    editorType: 'input',
    value: column.defaultValue === null ? '' : column.defaultValue,
  };
};

export const transformColumnsToDefaults = (cols: SqlColumnsShape) => {
  return Object.values(cols).map(defaultValueForColumn);
};

export const emptyDataRow = (cols: SqlColumnsShape) => ({
  uid: uuidv4(),
  values: transformColumnsToDefaults(cols),
});

export const emptyTableColumn = (): TableShapeColumn => ({
  uid: uuidv4(),
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
  uid: uuidv4(),
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
export const getMergedSqlColumnData = (
  row: SqlRow,
  editedColumns?: SqlObject,
) => {
  if (!editedColumns) return row;

  const mergedData = [...row];
  Object.entries(editedColumns).forEach(([index, value]) => {
    if (!value) {
      delete mergedData[Number(index)];
    } else {
      mergedData[Number(index)] = value;
    }
  });
  return mergedData;
};

export const normalizeSql = (sql: string) =>
  sql
    .replace(/\r\n/g, '\n') // normalize line endings
    .replace(/[ \t]+/g, ' ') // collapse spaces/tabs
    .replace(/\n{3,}/g, '\n\n') // reduce excessive blank lines
    .trim();

export const groupByModes: { label: string; value: SqlQueryModes }[] = [
  { label: 'Server Default', value: 'default' },
  { label: 'Legacy Enabled', value: 'legacy' },
  { label: 'Strict Modern', value: 'strict' },
];
