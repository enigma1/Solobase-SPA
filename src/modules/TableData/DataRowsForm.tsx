import { useState, useEffect, useMemo } from 'react';
import { Trash2Icon, ListPlusIcon, SquareActivityIcon } from 'lucide-react';
import {
  UseFormReturn,
  FormProvider,
  useForm,
  useFieldArray,
  Controller,
  FieldErrors,
  useWatch,
} from 'react-hook-form';
import {
  MAX_INSERT_DATA_ROWS,
  emptyDataRow,
  transformColumnsToDefaults,
} from '>/services/utils';

import { SqlColumnsShape } from '>/types';
import { CreateDataRowsForm } from './commonTypes';
import { DataRowEntry } from './DataRowEntry';

type DataRowsFormProps = {
  cols: SqlColumnsShape;
  columnsOrder: string[];
  form: UseFormReturn<CreateDataRowsForm>;
};

export const DataRowsForm = ({
  form,
  cols,
  columnsOrder,
}: DataRowsFormProps) => {
  const rowDefaults = useMemo(() => transformColumnsToDefaults(cols), [cols]);

  const {
    control,
    clearErrors,
    handleSubmit,
    formState: { isValid, errors },
  } = form;
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'rowsData',
  });

  const onRemove = (index: number) => {
    remove(index);
  };

  const onApplyDefaults = (uid: string) => {
    const activeIndex = fields.findIndex((r) => r.uid === uid);

    if (activeIndex >= 0) {
      update(activeIndex, {
        ...fields[activeIndex],
        values: structuredClone(rowDefaults),
      });
    }
  };

  const canAddRow = fields.length < MAX_INSERT_DATA_ROWS;

  const onAddRow = () => {
    const item = emptyDataRow(cols);
    append(item);
  };

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Insert Data Rows</h1>
        <div className='area-actions'>
          <button
            type='button'
            className='btn'
            onClick={onAddRow}
            title='Add new Row'
            disabled={!canAddRow}
          >
            <ListPlusIcon size={24} />
          </button>
        </div>
      </div>
      <div className='area-content'>
        <FormProvider {...form}>
          {fields.map((field, index) => {
            const bg = index % 2 ? 'odd' : 'even';
            return (
              <div
                key={field.id}
                className={`area-item separate ${bg}`}
                // className={`area-item separate ${bg} ${
                //   activeRowUid === field.uid ? 'active' : ''
                // }`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs font-semibold text-muted'>
                    Row {index + 1}
                  </span>
                  <span className='btn-group'>
                    <button
                      type='button'
                      className='btn-secondary'
                      onClick={() => onApplyDefaults(field.uid)}
                      title='Set Defaults on this row'
                    >
                      <SquareActivityIcon size={18} />
                    </button>
                    <button
                      type='button'
                      className='btn-secondary'
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                      title='Remove row'
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </span>
                </div>
                <DataRowEntry
                  rowIndex={index}
                  row={field}
                  cols={cols}
                  columnsOrder={columnsOrder}
                />
              </div>
            );
          })}
        </FormProvider>
      </div>
    </div>
  );
};
