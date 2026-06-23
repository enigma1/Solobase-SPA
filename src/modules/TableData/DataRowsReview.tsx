import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { extractNameFromRequired } from '>/services/utils';
import { DataCell } from '>/types';
import { DataRowForm, CreateDataRowsForm } from './commonTypes';

const renderValue = (cell: DataCell) => {
  switch (cell.editorType) {
    case 'json':
      return <pre>{JSON.stringify(cell.value, null, 2)}</pre>;

    case 'boolean':
      return cell.value ? 'true' : 'false';

    default:
      return String(cell.value ?? '');
  }
};

type DataRowsReviewProps = {
  database: string;
  table: string;
  form: UseFormReturn<CreateDataRowsForm>;
  columnsOrder: string[];
};

export const DataRowsReview = ({
  database,
  table,
  form,
  columnsOrder,
}: DataRowsReviewProps) => {
  const { getValues } = form;
  const { rowsData } = getValues();

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>New Rows to be inserted for [{table}]</h1>
      </div>
      <div className='area-content'>
        <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2'>
          <div className='font-semibold'>Database</div>
          <div>{database}</div>
          <div className='font-semibold'>Table</div>
          <div>{table}</div>
        </div>
        <h2>Rows</h2>
        <div>
          {rowsData?.map((row, index) => {
            const bg = index % 2 ? 'odd' : 'even';
            return (
              <div key={`${row.uid}-${index}`} className={`area-item ${bg}`}>
                <div className='grid grid-cols-[200px_1fr] gap-x-4 gap-y-2'>
                  {columnsOrder.map((columnName, colIndex) => {
                    const cell = row.values[colIndex];
                    return (
                      <div
                        key={`${row.uid}-lv-${columnName}`}
                        className={`area-item ${bg}`}
                      >
                        <div className='font-semibold'>{columnName}</div>
                        <div>{renderValue(cell)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
