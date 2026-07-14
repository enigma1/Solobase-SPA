import { useModal } from '>/services/hooks';
import { NumberField, TextAreaField, JsonEditor } from '>/modules';
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

type HasitProps = {
  input: string;
  parts: string[];
  at?: number;
};

export const hasit = ({ input, parts, at = 0 }: HasitProps) => {
  const value = input.toLowerCase();

  return parts.some((part) => value.indexOf(part.toLowerCase(), at) !== -1);
};

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
  } else if (isNumber(type)) {
    return (
      <NumberField
        defaultValue={cellValue == null ? '' : Number(cellValue)}
        onValueChange={(v) => {
          onChange(Number(v));
          setButtonStatus('confirm');
        }}
      />
    );
  } else {
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
  }
};
