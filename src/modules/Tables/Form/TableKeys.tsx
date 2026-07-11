import { useState, useEffect } from 'react';
import { UseFormReturn, useWatch, useFieldArray } from 'react-hook-form';
import {
  SquareActivityIcon,
  Trash2Icon,
  ListPlusIcon,
  ArchiveRestoreIcon,
} from 'lucide-react';
import {
  emptyTableColumnKey,
  tableColumnKeyList,
  MAX_COLUMNS_PER_KEY,
  MAX_TABLE_KEYS,
} from '>/services/utils';
import { FormTextField, FormComboField } from '>/modules';
import { TableFormShape } from './tableDefs';

type TableKeysFormProps = {
  form: UseFormReturn<TableFormShape>;
  onValidation: (valid: boolean) => void;
  originalValues: Readonly<TableFormShape>;
};

export const TableKeysForm = ({
  form,
  onValidation,
  originalValues,
}: TableKeysFormProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { control, reset, getValues, setValue, clearErrors } = form;

  const keys = useWatch({
    control,
    name: 'keys',
  });

  const columns = useWatch({
    control,
    name: 'cols',
  });

  const { fields, insert, append, remove, update } = useFieldArray({
    control,
    name: 'keys',
  });

  useEffect(() => {
    onValidation(form.formState.isValid);
  }, [form.formState.isValid]);

  const canAddKey = keys.length < MAX_TABLE_KEYS;
  const hasKeys = false;

  const onAddKey = () => {
    append(emptyTableColumnKey());
  };
  const onClearAllKeys = () => {};

  const onSetOriginals = () => {
    reset({
      ...getValues(),
      keys: structuredClone(originalValues.keys),
    });
    clearErrors();
  };

  const columnsList = columns.map((c) => ({
    label: c.field,
    value: c.field,
  }));

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Create Keys</h1>
        <div className='area-actions'>
          <button
            type='button'
            className='btn'
            onClick={onAddKey}
            title='Add key'
            disabled={!canAddKey}
          >
            <ListPlusIcon size={24} />
          </button>

          <button
            type='button'
            className='btn-secondary'
            onClick={onClearAllKeys}
            title='Remove all keys'
            disabled={!hasKeys}
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
        {fields.map((field, index) => {
          const keyType = keys[index]?.type;
          const bg = index % 2 ? 'odd' : 'even';
          return (
            <div
              key={field.id}
              className={`area-item separate ${bg} ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold text-muted'>
                  Key {index + 1}
                </span>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(index);
                  }}
                >
                  <Trash2Icon size={18} />
                </button>
              </div>

              <FormComboField
                id={`key-type-${index}`}
                name={`keys.${index}.type`}
                label='Key Type:'
                control={control}
                rules={{
                  required: 'Key type is required',
                }}
                $options={tableColumnKeyList}
                $placeholder='Select Key Type'
              />

              <FormComboField
                id={`column-index-${index}`}
                name={`keys.${index}.columns`}
                label='Columns:'
                control={control}
                rules={{
                  required: 'Column is required for assigned key',
                  validate: (v) => {
                    return (
                      (Array.isArray(v) && v.length > 0) ||
                      'At least one column must be assigned'
                    );
                  },
                }}
                $options={columnsList}
                $multiple
                $placeholder='Select Columns to form a key'
              />

              <FormTextField
                id={`key-name-${index}`}
                name={`keys.${index}.name`}
                control={control}
                label='Key Name:'
                disabled={keyType === 'PRIMARY'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
