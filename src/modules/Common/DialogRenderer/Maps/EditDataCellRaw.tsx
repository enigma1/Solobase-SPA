import { useModal } from '>/services/hooks';
import { hasit, getEnumOptions } from '>/services/utils';
import { NumberField, TextAreaField, ComboField, JsonEditor } from '>/modules';
import { SqlTypes } from '>/types';

const numberTypes = [
  'TINYINT',
  'SMALLINT',
  'MEDIUMINT',
  'INT',
  'INTEGER',
  'BIGINT',
  'DECIMAL',
  'NUMERIC',
  'FLOAT',
  'DOUBLE',
];

const isNumber = (type?: string) =>
  type ? hasit({ input: type, parts: numberTypes }) : false;

const getModeType = (type?: string) => {
  if (!type) return 'text';
  if (type === 'json') return 'tree';
  if (hasit({ input: type, parts: ['binary', 'varbinary'] })) {
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
  console.log('type', type);
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
  const enumObj = getEnumOptions(type);
  if (enumObj && typeof cellValue === 'string') {
    const options = enumObj.options?.map((item) => ({
      label: item,
      value: item,
    }));
    return (
      <ComboField
        id='sql-value'
        label='SQL Value:'
        defaultValue={cellValue}
        $options={options}
        onChange={(v: string | string[]) => {
          onChange(v);
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
