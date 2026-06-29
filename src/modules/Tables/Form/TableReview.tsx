import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { extractNameFromRequired } from '>/services/utils';
import { TableFormShape } from './tableDefs';

type TableColumnsFormProps = {
  database: string;
  form: UseFormReturn<TableFormShape>;
  onValidation: (valid: boolean) => void;
  originalValues: Readonly<TableFormShape>;
};

export const TableReview = ({
  database,
  form,
  onValidation,
  originalValues,
}: TableColumnsFormProps) => {
  const { getValues } = form;

  const values = getValues();
  useEffect(() => {
    onValidation(true);
  }, []);

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>
          Review Table Parameters for [{values.table}]
        </h1>
      </div>
      <div className='area-content'>
        <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center'>
          <div className='stand'>Database</div>
          <div>{database}</div>

          <div className='stand'>Table</div>
          <div>{values.table}</div>

          <div className='stand'>Charset</div>
          <div>{values.charset}</div>

          <div className='stand'>Collation</div>
          <div>{values.collation}</div>

          <div className='stand'>Engine</div>
          <div>{values.engine}</div>
        </div>
        <h3>Columns: {`${values.cols.length}`}</h3>
        <div>
          {values.cols.map((col, index) => {
            const bg = index % 2 ? 'odd' : 'even';
            return (
              <div key={`${col.field}-${index}`} className={`area-item ${bg}`}>
                <div>
                  <strong>{col.field}</strong> ({col.type})
                </div>
                {col.autoIncrement && <div>Auto Increment</div>}
                {col.unsigned && <div>Unsigned</div>}
                <div>Nullable: {col.nullable ? 'YES' : 'NO'}</div>
                {col.defaultValue && <div>Default: {col.defaultValue}</div>}
                {col.comment && <div>Comment: {col.comment}</div>}

                {col.params && Object.keys(col.params).length > 0 && (
                  <div>
                    {Object.entries(col.params).map(([k, v]) => (
                      <div key={k}>
                        {extractNameFromRequired(k)}: {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <h2>Keys to use</h2>
        <div>
          {values.keys.map((key, index) => {
            const bg = index % 2 ? 'odd' : 'even';
            return (
              <div key={`${key.type}-${index}`} className={`area-item ${bg}`}>
                {key.type}: {key.columns.join(',')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
