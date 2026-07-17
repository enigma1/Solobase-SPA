import { useState, useEffect, useRef } from 'react';
import { UseFormReturn, useWatch, useFieldArray } from 'react-hook-form';
import {
  SquareActivityIcon,
  ListPlusIcon,
  ArchiveRestoreIcon,
} from 'lucide-react';
import { emptyTableColumn, MAX_TABLE_COLUMNS } from '>/services/utils';
import { SqlColumns } from '>/types';
import { TableColumnEntry } from './TableColumnEntry';
import { TableFormShape } from './tableDefs';

type ColumnBasics = Pick<SqlColumns, 'field' | 'type'>;
type TableColumnsFormProps = {
  form: UseFormReturn<TableFormShape>;
  onValidation: (valid: boolean) => void;
  defaults: {
    column: ColumnBasics;
  };
  originalValues: Readonly<TableFormShape>;
};

export const TableColumnsForm = ({
  form,
  onValidation,
  defaults,
  originalValues,
}: TableColumnsFormProps) => {
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const columnsSnapshotRef = useRef<string>('');
  const { clearErrors, getValues, setValue, setValues, reset, control } = form;
  const columns = useWatch({ control, name: 'cols' });
  const { fields, insert, remove } = useFieldArray({
    control,
    name: 'cols',
  });

  useEffect(() => {
    const persistentColumns = columns.filter((c) => c.signature);
    const serialized = JSON.stringify(persistentColumns);

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

  const onSetOriginals = () => {
    reset({
      ...getValues(),
      cols: structuredClone(originalValues.cols),
    });
    clearErrors();
  };

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Create/Edit Columns</h1>
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
          <button
            type='button'
            className='btn-secondary'
            onClick={onSetOriginals}
            title='Set Original values'
          >
            <ArchiveRestoreIcon size={24} />
          </button>
        </div>
      </div>
      <div className='area-content'>
        {fields.map((field, idx) => {
          return (
            <TableColumnEntry
              form={form}
              key={`${field.uid}-${idx}`}
              uid={field.uid}
              index={idx}
              active={activeColumnId === field.uid}
              onSelect={() => setActiveColumnId(field.uid)}
              onRemove={() => remove(idx)}
            />
          );
        })}
      </div>
    </div>
  );
};
