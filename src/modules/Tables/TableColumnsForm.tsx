import { useState, useEffect } from 'react';
import {
  FormProvider,
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
  hasDuplicatedValues,
  isDuplicatedValue,
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
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const {
    getValues,
    clearErrors,
    setValue,
    control,
    formState: { errors },
  } = form;

  const { fields, insert, append, remove } = useFieldArray({
    control,
    name: 'cols',
  });

  const columns = useWatch({ control, name: 'cols' });

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
          const columnType = columns?.[index]?.type;
          const typeMeta = tableColumnTypes
            .flatMap((g) => g.options)
            .find((o) => o.value === columnType);

          const bg = index % 2 ? 'odd' : 'even';
          return (
            <div
              key={field.uid}
              className={`area-item separate ${bg} ${activeColumnId === field.uid ? 'active' : ''}`}
              onClick={() => setActiveColumnId(field.uid)}
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold text-muted'>
                  Column {index + 1}
                </span>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    const isActive = field.uid === activeColumnId;
                    remove(index);
                    if (!isActive) return;

                    const next = fields.filter((_, i) => i !== index);
                    setActiveColumnId(next[0]?.uid ?? null);
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
                    isUnique: (v) => {
                      const cols = getValues('cols');
                      const isDuplicated = isDuplicatedValue({
                        entries: cols,
                        prop: 'field',
                        value: v,
                        index,
                      });

                      return !isDuplicated || 'Column name must be unique';
                    },
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
                        field.onChange(v);
                        const params =
                          typeMeta?.params?.reduce(
                            (acc, p) => ({
                              ...acc,
                              [p]: '',
                            }),
                            {},
                          ) ?? {};

                        setValue(`cols.${index}.params`, params);
                      }}
                      $groups={tableColumnTypes}
                    />
                  </FormFieldWrapper>
                )}
              />
              {typeMeta?.params?.map((param) => {
                const label = `${param.replace(/\s*\*$/, '')}:`;
                const currentValue = columns?.[index]?.params?.[param];
                if (currentValue === undefined) {
                  setValue(`cols.${index}.params.${param}`, '');
                }
                return (
                  <FormTextField
                    key={param}
                    id={`cols-${index}-${param}`}
                    name={`cols.${index}.params.${param}`}
                    label={label}
                    control={control}
                    rules={{
                      validate: {
                        isValid: (v) => isColumnParameterValid(param, v),
                      },
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
