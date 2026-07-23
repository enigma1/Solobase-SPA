import { useState, useEffect, useMemo } from 'react';
import {
  Trash2Icon,
  ListPlusIcon,
  SquareActivityIcon,
  SquarePenIcon,
} from 'lucide-react';
import { UseFormReturn, FormProvider, useFieldArray } from 'react-hook-form';
import { historyStoreActions } from '>/services/stores';
import {
  MAX_INSERT_DATA_ROWS,
  emptyDataRow,
  transformColumnsToDefaults,
} from '>/services/utils';
import { ComboField } from '>/modules';
import { SqlColumnsShape } from '>/types';
import { CreateDataRowsForm } from './commonTypes';
import { DataRowEntry } from './DataRowEntry';

type DataRowsFormProps = {
  cols: SqlColumnsShape;
  columnsOrder: string[];
  form: UseFormReturn<CreateDataRowsForm>;
  onValidation: (valid: boolean) => void;
};

export const DataRowsForm = ({
  form,
  cols,
  columnsOrder,
  onValidation,
}: DataRowsFormProps) => {
  const [copyOption, setCopyOption] = useState<number>(-1);
  const rowDefaults = useMemo(
    () => transformColumnsToDefaults({ cols, columnsOrder }),
    [cols, columnsOrder],
  );

  const copiedRows = useMemo(
    () => historyStoreActions.getCopiedRowsList(columnsOrder),
    [columnsOrder],
  );
  const $copyOptions = useMemo(() => {
    const list = copiedRows.map((row, idx) => {
      const text = JSON.stringify(row).replace(/^\[/, '').replace(/\]$/, '');

      return {
        label: text.length > 30 ? `${text.slice(0, 30)}…` : text,
        value: idx.toString(),
      };
    });
    return list;
  }, [columnsOrder]);

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

  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid]);

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

  const onApplyCopy = (uid: string) => {
    const activeIndex = fields.findIndex((r) => r.uid === uid);
    if (copyOption >= 0 && activeIndex >= 0) {
      const row = copiedRows[copyOption];
      const values = rowDefaults.map((entry, idx) => ({
        ...entry,
        value: row[idx],
      }));

      update(activeIndex, {
        ...fields[activeIndex],
        ...(row && { values }),
      });
    }
  };

  const canAddRow = fields.length < MAX_INSERT_DATA_ROWS;

  const onAddRow = () => {
    const item = emptyDataRow({ cols, columnsOrder });
    append(item);
  };

  const handleCopyChange = (idx: string | string[]) => {
    setCopyOption(Number(idx));
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
      <div className='area-content' onClick={() => clearErrors()}>
        <FormProvider {...form}>
          {fields.map((field, idx) => {
            const bg = idx % 2 ? 'odd' : 'even';
            return (
              <div
                key={field.id}
                className={`area-item space-y-2 separate ${bg}`}
                // className={`area-item separate ${bg} ${
                //   activeRowUid === field.uid ? 'active' : ''
                // }`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs font-semibold text-muted'>
                    Row {idx + 1}
                  </span>
                  <span className='btn-group'>
                    <ComboField
                      $options={$copyOptions}
                      value={copyOption?.toString() ?? ''}
                      onChange={handleCopyChange}
                      $placeholder='No Copied Rows'
                    />
                    <button
                      type='button'
                      className='btn-secondary'
                      onClick={() => onApplyCopy(field.uid)}
                      title='Set selected row option on this row'
                    >
                      <SquarePenIcon size={18} />
                    </button>

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
                        onRemove(idx);
                      }}
                      title='Remove row'
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </span>
                </div>
                <DataRowEntry
                  rowIndex={idx}
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
