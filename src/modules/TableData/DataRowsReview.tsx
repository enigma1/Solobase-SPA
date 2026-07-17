import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PreviewTable } from '>/modules';
import { DataRowForm, CreateDataRowsForm } from './commonTypes';

type DataRowsReviewProps = {
  database: string;
  table: string;
  form: UseFormReturn<CreateDataRowsForm>;
  columnsOrder: string[];
  onValidation: (valid: boolean) => void;
};

export const DataRowsReview = ({
  database,
  table,
  form,
  columnsOrder,
  onValidation,
}: DataRowsReviewProps) => {
  const { getValues } = form;
  const { rowsData } = getValues();

  useEffect(() => {
    onValidation(true);
  }, []);

  const fit = columnsOrder.length <= 3 ? 'w-fit' : '';
  const rows = rowsData.map((rc) => rc.values.map((r) => r.value));

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
        <PreviewTable
          extraClassName={fit}
          columnsOrder={columnsOrder}
          rows={rows}
        />
      </div>
    </div>
  );
};
