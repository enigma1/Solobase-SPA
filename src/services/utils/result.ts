import { SqlTypes, SqlRow } from '>/types';

// export type Result<T> =
//   | { success: true; data: T }
//   | { success: false; error: Error };

// export const result = (() => {
//   const withOk = <T>(data: T): Result<T> => ({ success: true, data });
//   const withFail = <T = never>(error: Error): Result<T> => ({
//     success: false,
//     error,
//   });
//   const withResult = async <T>(
//     fn: () => Promise<T> | T,
//   ): Promise<Result<T>> => {
//     try {
//       const data = await fn();
//       return withOk(data);
//     } catch (e) {
//       return withFail(e as Error);
//     }
//   };
//   return {
//     withOk,
//     withFail,
//     withResult,
//   };
// })();

type GetCellValueProps = {
  row: SqlRow;
  columnsOrder: string[];
  colName: string;
};
export const getCellValue = ({
  row,
  columnsOrder,
  colName,
}: GetCellValueProps): SqlTypes | undefined => {
  const index = columnsOrder.indexOf(colName);
  if (index === -1) return null;
  return row[index];
};

type SingleColumnProps = {
  rows: SqlRow[];
  columnsOrder: string[];
  field: string;
};
export const getSingleColumnFromResult = ({
  rows,
  columnsOrder,
  field,
}: SingleColumnProps) => {
  const values = rows.map((row) =>
    getCellValue({ row, columnsOrder, colName: field }),
  );
  if (values.some((v) => v === null)) {
    return [];
  }
  return values as string[];
};

type ColumnsFromResultProps = {
  rows: SqlRow[];
  columnsOrder: string[];
  fields: string[];
};
export const getOnlyColumnsFromResult = ({
  rows,
  columnsOrder,
  fields,
}: ColumnsFromResultProps) => {
  const indexes = fields.map((field) => columnsOrder.indexOf(field));
  return rows.map((row) => indexes.map((i) => row[i]));
};

export const getColumnsFromResult = ({
  rows,
  columnsOrder,
  fields,
}: ColumnsFromResultProps) => {
  const fieldSet = new Set(fields);

  return rows.map((row) =>
    row.map((value, index) =>
      fieldSet.has(columnsOrder[index]) ? value : null,
    ),
  );
};

type ColumnsFromRowProps = {
  row: SqlRow;
  columnsOrder: string[];
  fields: string[];
};
export const getColumnsFromRow = ({
  row,
  columnsOrder,
  fields,
}: ColumnsFromRowProps): Record<string, SqlTypes | null> => {
  const obj: Record<string, SqlTypes | null> = {};

  for (const field of fields) {
    const index = columnsOrder.indexOf(field);
    obj[field] = index === -1 ? null : row[index];
  }

  return obj;
};

export const createFileSaveUrl = (blob: Blob, filename = 'unknown-file.gz') => {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};
