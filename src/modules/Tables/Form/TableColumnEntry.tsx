import { useState, useEffect, useMemo } from 'react';
import {
  useFormContext,
  useWatch,
  useFieldArray,
  Controller,
  UseFormReturn,
} from 'react-hook-form';
import {
  Trash2Icon,
  PanelBottomCloseIcon,
  PanelBottomOpenIcon,
} from 'lucide-react';
import { FormTextField, FormCheckboxField, FormComboField } from '>/modules';
import {
  tableColumnTypes,
  flatColumnTypeSet,
  isColumnParameterValid,
  isDuplicatedValue,
  normalizeColumnParameter,
} from '>/services/utils';
import { TableShape } from '>/types';
import { TableFormShape } from './tableDefs';

type TableColumnEntryProps = {
  form: UseFormReturn<TableFormShape>;
  uid: string;
  index: number;
  active: boolean;
  onSelect: () => void;
  onRemove: (uid: string) => void;
};
export const TableColumnEntry = ({
  form,
  active,
  onSelect,
  onRemove,
  uid,
  index,
}: TableColumnEntryProps) => {
  const [showBottomFields, setShowBottomFields] = useState(false);
  const { control, setValue, setValues, getValues, watch } = form;

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

  const { typeMeta, groupMeta } = useMemo(() => {
    const group = tableColumnTypes.find((g) =>
      g.options.some((o) => o.value === columnType),
    );

    return {
      typeMeta: group?.options.find((o) => o.value === columnType),
      groupMeta: group?.meta,
    };
  }, [columnType]);

  const params =
    useWatch({
      control,
      name: `cols.${currentIndex}.params`,
    }) ?? {};

  useEffect(() => {
    if (!typeMeta?.params) return;

    const result = getValues(`cols.${currentIndex}.params`);
    if (!result) return;

    let changed = false;

    for (const p of typeMeta.params) {
      const key = normalizeColumnParameter(p);
      const existingValue = params?.[key] ?? '';

      if (result[key] !== existingValue) {
        result[key] = existingValue;
        changed = true;
      }
    }

    if (changed) {
      setValue(`cols.${currentIndex}.params`, result, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [typeMeta, currentIndex]);

  const enableAutoIncrement = (index: number) => {
    setValues((form) => ({
      ...form,
      cols: form.cols.map((c, i) => ({
        ...c,
        autoIncrement: i === index,
        nullable: i === index ? false : c.nullable,
        defaultValue: i === index ? undefined : c.defaultValue,
      })),
    }));
  };

  type ResetOnTypeChangeProps = {
    type: string;
    params: Record<string, string | number> | undefined;
    index: number;
  };
  const resetOnTypeChange = ({
    type,
    params,
    index,
  }: ResetOnTypeChangeProps) => {
    setValues((form) => ({
      ...form,
      cols: form.cols.map((c, i) =>
        i === index
          ? {
              ...c,
              type,
              params,
              autoIncrement: false,
              defaultValue: undefined,
              unsigned: false,
            }
          : c,
      ),
    }));
  };

  const bg = index % 2 ? 'odd' : 'even';
  return (
    <div
      className={`area-item space-y-2 separate ${bg} ${active ? 'active' : ''}`}
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
          className='btn-micro'
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

      <FormComboField
        id={`table-type-${index}`}
        name={`cols.${currentIndex}.type`}
        label='Type:'
        control={control}
        rules={{
          required: 'Column type is required',
          validate: (value) => {
            const exists = flatColumnTypeSet.has(String(value));
            return exists || 'A valid column type must be selected';
          },
        }}
        onValueChange={(v) => {
          const params =
            typeMeta?.params?.reduce(
              (acc, p) => ({
                ...acc,
                [p]: '',
              }),
              {},
            ) ?? {};

          resetOnTypeChange({
            index: currentIndex,
            type: v as string,
            params,
          });
        }}
        $groups={tableColumnTypes}
        $placeholder='Select Column Type'
      />

      {typeMeta?.params?.map((p) => {
        const param = normalizeColumnParameter(p);
        return (
          <FormTextField
            key={`cols-${index}-${param}`}
            id={`cols-${index}-${param}`}
            name={`cols.${currentIndex}.params.${param}`}
            label={`${p}:`}
            control={control}
            rules={{
              validate: {
                isValid: (v) => isColumnParameterValid(p, v),
              },
            }}
          />
        );
      })}

      <div className='inline-wrap my-2 mt-4 justify-between items-center'>
        <div className='inline-wrap'>
          {groupMeta?.hasUnsigned && (
            <FormCheckboxField
              name={`cols.${index}.unsigned`}
              control={control}
              label='Unsigned'
            />
          )}

          {groupMeta?.hasAutoIncrement && (
            <FormCheckboxField
              name={`cols.${index}.autoIncrement`}
              control={control}
              onValueChange={(checked) => {
                if (checked) {
                  enableAutoIncrement(index);
                } else {
                  setValue(`cols.${index}.autoIncrement`, false);
                }
              }}
              label='Auto Increment'
            />
          )}

          <FormCheckboxField
            name={`cols.${index}.nullable`}
            control={control}
            onValueChange={(checked) => {
              setValue(`cols.${index}.nullable`, checked);
              if (checked) {
                setValue(`cols.${index}.autoIncrement`, false);
              }
            }}
            label='Allow NULL'
          />
        </div>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            setShowBottomFields((v) => !v);
          }}
          className='btn-micro ml-auto'
        >
          {showBottomFields ? (
            <PanelBottomCloseIcon size={18} />
          ) : (
            <PanelBottomOpenIcon size={18} />
          )}
        </button>
      </div>
      {showBottomFields && (
        <>
          <FormTextField
            id={`cols-${index}-default`}
            name={`cols.${index}.defaultValue`}
            control={control}
            onValueChange={(value) => {
              setValue(`cols.${index}.defaultValue`, value);
              if (value.length > 0) {
                setValue(`cols.${index}.autoIncrement`, false);
              }
            }}
            label='Default Value:'
          />
          <FormTextField
            id={`cols-${index}-comment`}
            name={`cols.${index}.comment`}
            control={control}
            label='Comment:'
          />
        </>
      )}
    </div>
  );
};
