import { UpdateRowsRequest } from '>/services/api';
import {
  CollectionRow,
  DbTableRow,
  ScalarObject,
  SqlColumnsShape,
  SqlRow,
} from '>/types';

type UpdateRowsCollectionProps = {
  componentShape: Record<string, CollectionRow>;
  table: string;
  originalRows: CollectionRow[];
};

export const updateRowsCollectionTransformer = (
  props: UpdateRowsCollectionProps,
): UpdateRowsRequest => {
  const { componentShape, table, originalRows } = props;
  const rowsToUpdate = Object.entries(componentShape).map(([_id, doc]) => {
    const row = originalRows.find((row) => row._id === _id);
    if (!row) {
      throw new Error(`Row with _id ${_id} not found`);
    }
    const updatedValues = doc;
    return {
      updatedValues,
      originalRow: row,
    };
  });
  return { table, dataRows: rowsToUpdate };
};

type UpdateRowsSqlProps = {
  componentShape: Record<number, ScalarObject>;
  cols: SqlColumnsShape;
  table: string;
  originalRows: DbTableRow[];
};

export const updateRowsSqlTransformer = (
  props: UpdateRowsSqlProps,
): UpdateRowsRequest => {
  const { componentShape, table, originalRows, cols } = props;

  // Transformer - componentShape into API format
  const rowsToUpdate = Object.entries(componentShape).map(([rId, row]) => {
    const originalRow = originalRows[Number(rId)] as SqlRow;
    const updatedValues: ScalarObject = {};

    // Create an object of the updated values with column names as keys
    const colNames = Object.keys(cols);
    Object.entries(row).forEach(([key, value]) => {
      const colName = colNames[Number(key)];
      updatedValues[colName] = value;
    });
    return { updatedValues, originalRow, rowIndex: Number(rId) };
  });
  return { table, dataRows: rowsToUpdate };
};
