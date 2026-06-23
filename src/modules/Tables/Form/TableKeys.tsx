import { useState, useEffect } from 'react';
import {
  UseFormReturn,
  Controller,
  useWatch,
  useFieldArray,
} from 'react-hook-form';
import { SquareActivityIcon, Trash2Icon, ListPlusIcon } from 'lucide-react';
import { FormTextField, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import {
  emptyTableColumnKey,
  tableColumnKeyList,
  MAX_COLUMNS_PER_KEY,
  MAX_TABLE_KEYS,
} from '>/services/utils';
import { TableShape } from '>/types';

type TableKeysFormProps = {
  form: UseFormReturn<TableShape>;
  onValidation: (valid: boolean) => void;
};

export const TableKeysForm = ({ form, onValidation }: TableKeysFormProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { control } = form;

  const keys = useWatch({
    control,
    name: 'keys',
  });

  const columns = useWatch({
    control,
    name: 'cols',
  });

  const { fields, insert, append, remove } = useFieldArray({
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
              <Controller
                name={`keys.${index}.type`}
                control={control}
                rules={{
                  required: 'Key type is required',
                }}
                render={({ field, fieldState }) => (
                  <FormFieldWrapper
                    label='Key Type:'
                    htmlFor={`key-type-${index}`}
                    $status={fieldState.error ? 'error' : undefined}
                    $notice={fieldState.error?.message}
                  >
                    <ComboBox
                      id={`key-type-${index}`}
                      value={field.value}
                      onChange={field.onChange}
                      $options={tableColumnKeyList}
                    />
                  </FormFieldWrapper>
                )}
              />
              <Controller
                name={`keys.${index}.columns`}
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldWrapper
                    label='Columns:'
                    htmlFor={`column-index-${index}`}
                    $status={fieldState.error ? 'error' : undefined}
                    $notice={fieldState.error?.message}
                  >
                    <ComboBox
                      id={`column-index-${index}`}
                      value={field.value}
                      onChange={field.onChange}
                      $options={columnsList}
                      $multiple
                    />
                  </FormFieldWrapper>
                )}
                rules={{
                  required: 'Column is required for assigned key',
                  validate: (v) => {
                    return (
                      (Array.isArray(v) && v.length > 0) ||
                      'At least one column must be assigned'
                    );
                  },
                }}
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
