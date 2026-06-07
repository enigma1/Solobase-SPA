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
  tableColumnTypes,
  emptyTableColumn,
  isColumnParameterValid,
  MAX_TABLE_COLUMNS,
} from '>/services/utils';
import { SqlColumns, TableShape } from '>/types';

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const {
    clearErrors,
    setValue,
    control,
    formState: { errors },
  } = form;

  const { fields, insert, append, remove } = useFieldArray({
    control,
    name: 'cols',
  });

  const columns =
    useWatch({
      control,
      name: 'cols',
    }) ?? [];

  const {
    insert: insertParam,
    append: appendParam,
    remove: removeParam,
  } = useFieldArray({
    control,
    name: 'colsParams',
  });

  useEffect(() => {
    const valid =
      columns.length > 0 &&
      columns.every((c) => c.field?.trim() && c.type?.trim());

    onValidation(valid);
  }, [columns]);

  const canAddColumn = columns.length < MAX_TABLE_COLUMNS;
  const canApplyDefaults =
    columns.length > 0 && activeIndex != null && columns?.[activeIndex] != null;

  const onApplyDefaults = () => {
    if (!canApplyDefaults) return;

    setValue(`cols.${activeIndex}`, {
      ...columns[activeIndex],
      ...defaults.column, // or whatever shape you define
    });
    clearErrors();
  };

  const onAddColumn = () => {
    if (activeIndex == null) {
      append({ ...emptyTableColumn });
      appendParam({});
      return;
    }

    insert(activeIndex + 1, { ...emptyTableColumn });
    insertParam(activeIndex + 1, {});
    setActiveIndex(activeIndex + 1);
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
          const columnType = columns[index]?.type;
          const typeMeta = tableColumnTypes
            .flatMap((g) => g.options)
            .find((o) => o.value === columnType);

          const bg = index % 2 ? 'odd' : 'even';
          return (
            <div
              key={field.id}
              className={`area-item separate ${bg} ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold text-muted'>
                  Column {index + 1}
                </span>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue(`colsParams.${index}`, {});
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
                      onChange={(v) => {
                        setValue(`colsParams.${index}`, {});
                        field.onChange(v);
                      }}
                      $groups={tableColumnTypes}
                    />
                  </FormFieldWrapper>
                )}
              />
              {typeMeta?.params?.map((param) => (
                <FormTextField
                  key={param}
                  id={`cols-${index}-${param}`}
                  name={`colsParams.${index}.${param}`}
                  label={`${param}:`}
                  control={control}
                  rules={{
                    validate: {
                      isValid: (v) => isColumnParameterValid(param, v),
                    },
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
