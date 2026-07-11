import { useState } from 'react';
import { useModal } from '>/services/hooks';
import { TextAreaField, JsonEditor } from '>/modules';
import { SqlTypes, SqlObject } from '>/types';

type HasitProps = {
  input: string;
  part: string;
  at?: number;
};
export const hasit = ({ input, part, at = 0 }: HasitProps) => {
  return input.toLowerCase().indexOf(part.toLowerCase(), at) !== -1;
};

const getModeType = (type?: string) => {
  if (!type) return 'text';
  if (type === 'json') return 'tree';
  if (hasit({ input: type, part: 'varbinary' })) {
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
  // const [value, setValue] = useState(cellValue);
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
