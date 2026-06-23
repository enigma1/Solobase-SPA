import ReactJsonView from '@microlink/react-json-view';
import { useModal } from '>/services/hooks';
import { Scalar } from '>/types';
import { TextAreaField } from '>/modules';

type EditDataCellRawProps = {
  value: Scalar;
  onChange: (value: Scalar) => void;
};

export const EditDataCellRaw = ({
  value: cellValue,
  onChange,
}: EditDataCellRawProps) => {
  const { setButtonStatus } = useModal();

  const isObject = typeof cellValue === 'object' && cellValue !== null;
  if (isObject) {
    return (
      <ReactJsonView
        theme='bright:inverted'
        src={cellValue}
        name={false}
        // collapsed={true}
        onEdit={(e) => onChange(e.updated_src as Scalar)}
        onAdd={(e) => onChange(e.updated_src as Scalar)}
        onDelete={(e) => onChange(e.updated_src as Scalar)}
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
