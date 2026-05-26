import { ScalarObject, SqlRow } from '>/types';

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
