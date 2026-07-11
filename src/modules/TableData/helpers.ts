import { UpdateDataRowsRequest, DeleteDataRowsRequest } from '>/services/api';
import { SqlColumnsShape, SqlObject, SqlRow, TokenRow } from '>/types';

type UpdateDataRowsSqlProps = {
  componentShape: Record<number, SqlObject>;
  cols: SqlColumnsShape;
  database: string;
  table: string;
  originalRows: SqlRow[];
  rowTokens?: TokenRow[];
};

export const updateRowsSqlTransformer = (
  props: UpdateDataRowsSqlProps,
): UpdateDataRowsRequest => {
  const { componentShape, database, table, originalRows, rowTokens, cols } =
    props;

  // Transformer - componentShape into API format
  const rowsToUpdate = Object.entries(componentShape).map(([rId, row]) => {
    const rowToken = rowTokens?.[Number(rId)];
    const originalRow = originalRows[Number(rId)] as SqlRow;
    const updatedValues: SqlObject = {};

    // Create an object of the updated values with column names as keys
    const colNames = Object.keys(cols);
    Object.entries(row).forEach(([key, value]) => {
      const colName = colNames[Number(key)];
      updatedValues[colName] = value;
    });
    return {
      updatedValues,
      originalRow,
      ...(rowToken ? { rowToken } : {}),
    };
  });
  return { database, table, dataRows: rowsToUpdate };
};

type DeleteDataRowsSqlProps = {
  database: string;
  table: string;
  originalRows: SqlRow[];
  rowTokens?: TokenRow[];
};

export const deleteRowsSqlTransformer = (
  props: DeleteDataRowsSqlProps,
): DeleteDataRowsRequest => {
  const { database, table, originalRows, rowTokens } = props;

  // Transformer - componentShape into API format
  const rowsToDelete = originalRows.map((originalRow, idx) => ({
    originalRow,
    ...(rowTokens?.[idx] ? { rowToken: rowTokens[idx] } : {}),
  }));
  return { database, table, dataRows: rowsToDelete };
};
