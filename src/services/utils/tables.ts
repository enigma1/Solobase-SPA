import { PrimeObject, PrimeRow } from '>/types';

export const getMergedSimpleColumnData = (
  row: PrimeRow,
  editedColumns?: PrimeObject,
) => {
  if (!editedColumns) return row;

  const mergedData = [...row];
  Object.entries(editedColumns).forEach(([index, value]) => {
    mergedData[Number(index)] = value;
  });
  return mergedData;
};
