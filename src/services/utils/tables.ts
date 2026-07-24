import type { SqlRow, SqlObject, PrimeObject } from '>/types';

export const getMergedSimpleColumnData = (
  row: SqlRow,
  editedColumns?: PrimeObject,
) => {
  if (!editedColumns) return row;

  const mergedData = [...row];
  Object.entries(editedColumns).forEach(([index, value]) => {
    mergedData[Number(index)] = value;
  });
  return mergedData;
};
