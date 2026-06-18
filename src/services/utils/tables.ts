import type {
  SqlRow,
  SqlColumnsShape,
  PrimeObject,
  PrimeRow,
  SqlColumns,
} from '>/types';
import type { RunRawQueryResponse } from '>/services/api';

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

// export const transformRawColumns = (
//   fields: { name: string; table?: string; type?: string }[],
// ): SqlColumnsShape => {
//   return Object.fromEntries(
//     fields.map((f) => {
//       const field = f.table ? `${f.table}.${f.name}` : f.name;

//       return [
//         f.name, // IMPORTANT: keep UI key as simple column name
//         {
//           field,
//           type: f.type ?? 'unknown',
//           nullable: 'NO',
//           key: '',
//           defaultValue: null,
//           extra: '',
//         } satisfies SqlColumns,
//       ];
//     }),
//   );
// };

// export const transformResultToTable = (res: RunRawQueryResponse) => {
//   if (res.mode !== 'resultset') return res;

//   const columnsOrder = res.columns?.map((c) => c.name) ?? [];

//   const cols = res.columns ? transformRawColumns(res.columns) : {};

//   return {
//     ...res,
//     rows: res.rows as Record<string, unknown>[],
//     cols,
//     columnsOrder,
//   };
// };
