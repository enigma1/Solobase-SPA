import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { Trash2Icon } from 'lucide-react';
import { FormTextField, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import {
  tableColumnTypes,
  isColumnParameterValid,
  isDuplicatedValue,
} from '>/services/utils';
import { TableShape } from '>/types';

type TableColumnEntryProps = {
  uid: string;
  index: number;
  active: boolean;
  onSelect: () => void;
  onRemove: (uid: string) => void;
};
export const TableColumnEntry = ({
  active,
  onSelect,
  onRemove,
  uid,
  index,
}: TableColumnEntryProps) => {
  const { control, setValue, getValues } = useFormContext<TableShape>();

  const cols =
    useWatch({
      control,
      name: 'cols',
    }) ?? [];

  const currentIndex = useMemo(() => {
    return cols.findIndex((c) => c.uid === uid);
  }, [cols, uid]);

  const columnType = useWatch({
    control,
    name: `cols.${currentIndex}.type`,
  });

  const typeMeta = useMemo(() => {
    return tableColumnTypes
      .flatMap((g) => g.options)
      .find((o) => o.value === columnType);
  }, [columnType]);

  const params =
    useWatch({
      control,
      name: `cols.${currentIndex}.params`,
    }) ?? {};

  useEffect(() => {
    if (!typeMeta?.params) return;

    const next = Object.fromEntries(
      typeMeta.params.map((p) => [p, params[p] ?? '']),
    );

    setValue(`cols.${currentIndex}.params`, next);
  }, [typeMeta, currentIndex]);

  const bg = index % 2 ? 'odd' : 'even';
  return (
    <div
      className={`area-item separate ${bg} ${active ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className='flex items-center justify-between mb-2'>
        <span className='text-xs font-semibold text-muted'>
          Column {index + 1}
        </span>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onRemove(uid);
          }}
        >
          <Trash2Icon size={18} />
        </button>
      </div>
      <FormTextField
        id={`table-name-${index}`}
        name={`cols.${currentIndex}.field`}
        label='Field Name:'
        control={control}
        rules={{
          required: 'A column name is required',
          minLength: { value: 1, message: 'min 1 character' },
          maxLength: { value: 64, message: 'max 64 characters' },
          validate: {
            isString: (v) => typeof v === 'string' || 'Must be a string',
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
        name={`cols.${currentIndex}.type`}
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

                setValue(`cols.${currentIndex}.params`, params);
              }}
              $groups={tableColumnTypes}
            />
          </FormFieldWrapper>
        )}
      />
      {typeMeta?.params?.map((param) => {
        const label = `${param.replace(/\s*\*$/, '')}:`;
        return (
          <FormTextField
            key={param}
            id={`cols-${index}-${param}`}
            name={`cols.${currentIndex}.params.${param}`}
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
};
