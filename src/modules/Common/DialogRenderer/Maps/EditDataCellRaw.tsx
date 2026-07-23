import { useModal } from '>/services/hooks';
import {
  hasit,
  getComboOptions,
  numberTypes,
  objectTypes,
} from '>/services/utils';
import { NumberField, TextAreaField, ComboField, JsonEditor } from '>/modules';
import { SqlTypes } from '>/types';

const isNumber = (type?: string) =>
  type ? hasit({ input: type, parts: numberTypes }) : false;

const getModeType = (type?: string) => {
  if (!type) return 'text';
  if (type === 'json') return 'tree';
  if (hasit({ input: type, parts: objectTypes })) {
    return 'text';
  }
};

type EditDataCellRawProps = {
  value: SqlTypes;
  onChange: (value: SqlTypes) => void;
  type?: string;
};

export const EditDataCellRaw = ({
  value: cellValue,
  onChange,
  type,
}: EditDataCellRawProps) => {
  const { setButtonStatus } = useModal();
  const mode = getModeType(type);
  if (mode) {
    return (
      <JsonEditor
        value={cellValue}
        onChange={(v) => {
          onChange(v);
          setButtonStatus('confirm');
        }}
        options={{
          mode,
        }}
      />
    );
  }
  const comboObj = getComboOptions(type);
  if (comboObj && typeof cellValue === 'string') {
    const isMulti = type ? hasit({ input: type, parts: ['set('] }) : false;
    const value = isMulti
      ? cellValue
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : cellValue;

    const options = comboObj.options?.map((item) => ({
      label: item,
      value: item,
    }));

    return (
      <ComboField
        id='sql-value'
        label='SQL Value:'
        defaultValue={value}
        $multiple={isMulti}
        $options={options}
        onChange={(v: string | string[]) => {
          const sqlValue = Array.isArray(v) ? v.filter(Boolean).join(',') : v;
          onChange(sqlValue);
          setButtonStatus('confirm');
        }}
      />
    );
  }

  if (isNumber(type)) {
    return (
      <NumberField
        id='sql-value'
        label='SQL Value:'
        defaultValue={cellValue == null ? '' : Number(cellValue)}
        onValueChange={(v) => {
          onChange(Number(v));
          setButtonStatus('confirm');
        }}
      />
    );
  }

  return (
    <TextAreaField
      defaultValue={String(cellValue ?? '')}
      id='sql-value'
      label='SQL Value:'
      className='text-dialog-area resize-none input border'
      wrapClass='h-full'
      onChange={(e) => {
        onChange(e.target.value);
        setButtonStatus('confirm');
      }}
    />
  );
};
