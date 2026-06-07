import {
  UseFormReturn,
  Controller,
  useWatch,
  useFieldArray,
} from 'react-hook-form';

import { FormTextField, ComboBox } from '>/modules';
import { TableShape } from '>/types';

type TableKeysFormProps = {
  form: UseFormReturn<TableShape>;
  onValidation: (valid: boolean) => void;
};

export const TableKeysForm = ({ form, onValidation }: TableKeysFormProps) => {
  const {
    clearErrors,
    setValues,
    setValue,
    control,
    formState: { errors },
  } = form;

  const columns =
    useWatch({
      control,
      name: 'cols',
    }) ?? [];

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Create Columns</h1>
        <div className='area-actions'>
          <button
            type='button'
            className='btn'
            onClick={onAddKey}
            title='Add new column'
            disabled={canAddKey}
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
              <FormTextField
                id={`table-name-${index}`}
                name={`cols.${index}.field`}
                label='Field Name:'
                control={control}
                rules={{
                  required: 'A column name is required',
                  minLength: { value: 1, message: 'min 1 character' },
                  maxLength: { value: 64, message: 'max 64 characters' },
                  validate: {
                    isString: (v) =>
                      typeof v === 'string' || 'Must be a string',
                    noNullBytes: (v) =>
                      (typeof v === 'string' && !/\u0000/.test(v)) ||
                      'Invalid characters',
                    noWhitespaceEdges: (v) =>
                      (typeof v === 'string' && !/^\s|\s$/.test(v)) ||
                      'No lead/trail spaces',
                  },
                }}
              />
              <Controller
                name={`cols.${index}.type`}
                control={control}
                render={({ field, fieldState }) => (
                  <FormFieldWrapper
                    label='Type:'
                    htmlFor={`table-type-${index}`}
                    $status={fieldState.error ? 'error' : undefined}
                    $notice={fieldState.error?.message}
                  >
                    <ComboBox
                      id={`table-type-${index}`}
                      value={field.value}
                      onChange={field.onChange}
                      $groups={tableColumnTypes}
                    />
                  </FormFieldWrapper>
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
