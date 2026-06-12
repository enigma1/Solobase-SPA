import { DataCell } from '>/types';

export type DataRowForm = {
  uid: string;
  values: DataCell[];
};

export type CreateDataRowsForm = {
  rowsData: DataRowForm[];
};
