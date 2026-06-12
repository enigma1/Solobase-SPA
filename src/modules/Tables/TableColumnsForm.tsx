import { useState, useEffect, useRef } from 'react';
import {
  FormProvider,
  UseFormReturn,
  useWatch,
  useFieldArray,
} from 'react-hook-form';
import { SquareActivityIcon, ListPlusIcon } from 'lucide-react';
import {
  tableColumnTypes,
  emptyTableColumn,
  isColumnParameterValid,
  isDuplicatedValue,
  MAX_TABLE_COLUMNS,
} from '>/services/utils';
import { SqlColumns, TableShape } from '>/types';
import { TableColumnEntry } from './TableColumnEntry';

type ColumnBasics = Pick<SqlColumns, 'field' | 'type'>;
type TableColumnsFormProps = {
  form: UseFormReturn<TableShape>;
  onValidation: (valid: boolean) => void;
  defaults: {
    column: ColumnBasics;
  };
};

export const TableColumnsForm = ({
  form,
  onValidation,
  defaults,
}: TableColumnsFormProps) => {
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const columnsSnapshotRef = useRef<string>('');
  const { clearErrors, setValue, control } = form;
  const columns = useWatch({ control, name: 'cols' });
  const { fields, insert, append, remove } = useFieldArray({
    control,
    name: 'cols',
  });

  useEffect(() => {
    const serialized = JSON.stringify(columns ?? []);

    if (!columnsSnapshotRef.current) {
      columnsSnapshotRef.current = serialized;
      return;
    }

    if (columnsSnapshotRef.current !== serialized) {
      setValue('keys', []);
      columnsSnapshotRef.current = serialized;
    }
  }, [columns, setValue]);

  useEffect(() => {
    onValidation(fields.length > 0 && form.formState.isValid);
  }, [fields, form.formState.isValid]);

  const getActiveColumnIndex = () => {
    return fields.findIndex((c) => c.uid === activeColumnId);
  };

  const canAddColumn = fields.length < MAX_TABLE_COLUMNS;
  const canApplyDefaults = getActiveColumnIndex() !== -1;

  const onApplyDefaults = () => {
    const idx = getActiveColumnIndex();
    if (idx === -1) return;

    const column = fields[idx];

    setValue(
      `cols.${idx}`,
      {
        ...column,
        ...defaults.column,
      },
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
    clearErrors(`cols.${idx}`);
  };

  const onAddColumn = () => {
    const item = emptyTableColumn();
    const idx = getActiveColumnIndex();
    const insertIndex = idx === -1 ? fields.length : idx + 1;
    setActiveColumnId(item.uid);
    insert(insertIndex, item);
  };

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Create Columns</h1>
        <div className='area-actions'>
          <button
            type='button'
            className='btn'
            onClick={onAddColumn}
            title='Add new column'
            disabled={!canAddColumn}
          >
            <ListPlusIcon size={24} />
          </button>
          <button
            type='button'
            className='btn-secondary'
            onClick={onApplyDefaults}
            title='Set Defaults on the active column'
            disabled={!canApplyDefaults}
          >
            <SquareActivityIcon size={24} />
          </button>
        </div>
      </div>
      <div className='area-content'>
        {fields.map((field, index) => {
          return (
            <FormProvider key={field.uid} {...form}>
              <TableColumnEntry
                uid={field.uid}
                index={index}
                active={activeColumnId === field.uid}
                onSelect={() => setActiveColumnId(field.uid)}
                onRemove={() => remove(index)}
              />
            </FormProvider>
          );
        })}
      </div>
    </div>
  );
};
