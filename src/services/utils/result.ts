import { Scalar } from '>/types';

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export const result = (() => {
  const withOk = <T>(data: T): Result<T> => ({ success: true, data });
  const withFail = <T = never>(error: Error): Result<T> => ({
    success: false,
    error,
  });
  const withResult = async <T>(
    fn: () => Promise<T> | T,
  ): Promise<Result<T>> => {
    try {
      const data = await fn();
      return withOk(data);
    } catch (e) {
      return withFail(e as Error);
    }
  };
  return {
    withOk,
    withFail,
    withResult,
  };
})();

type GetDatabaseField = {
  row: Scalar[];
  columnsOrder: string[];
  colName: string;
};
export const getDatabaseField = ({
  row,
  columnsOrder,
  colName,
}: GetDatabaseField): Scalar => {
  const index = columnsOrder.indexOf(colName);
  if (index === -1) return null;
  return row[index];
};

// export const getDatabaseNamesFromResult = (
//   rows: Scalar[][],
//   columnsOrder: string[],
// ) => {
//   const values = rows.map((row) =>
//     getDatabaseField(row, columnsOrder, 'SCHEMA_NAME'),
//   );
//   if (values.some((v) => v === null)) {
//     return [];
//   }
//   return values as string[];
// };

type SingleColumnProps = {
  rows: Scalar[][];
  columnsOrder: string[];
  field: string;
};
export const getSingleColumnFromResult = ({
  rows,
  columnsOrder,
  field,
}: SingleColumnProps) => {
  const values = rows.map((row) =>
    getDatabaseField({ row, columnsOrder, colName: field }),
  );
  if (values.some((v) => v === null)) {
    return [];
  }
  return values as string[];
};

type ColumnsFromResultProps = {
  rows: Scalar[][];
  columnsOrder: string[];
  fields: string[];
};
export const getColumnsFromResult = ({
  rows,
  columnsOrder,
  fields,
}: ColumnsFromResultProps) => {
  const result = fields.map((f) =>
    getSingleColumnFromResult({ rows, columnsOrder, field: f }),
  );
  return result;
};

type ColumnsFromRowProps = {
  row: Scalar[];
  columnsOrder: string[];
  fields: string[];
};
export const getColumnsFromRow = ({
  row,
  columnsOrder,
  fields,
}: ColumnsFromRowProps): Record<string, Scalar | null> => {
  const obj: Record<string, Scalar | null> = {};

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
