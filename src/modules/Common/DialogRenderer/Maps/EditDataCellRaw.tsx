import ReactJsonView from '@microlink/react-json-view';
import { useModal } from '>/services/hooks';
import { Scalar } from '>/types';

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
      <textarea
        defaultValue={String(cellValue ?? '')}
        // rows={50}
        onChange={(e) => {
          setButtonStatus('confirm');
          onChange(e.target.value);
        }}
        className='text-dialog-area'
      />
    );
  }
};
