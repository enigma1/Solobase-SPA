import { ComboField } from '>/modules';
import { pageSizeValues } from '>/services/utils/appSettings';
import { WrapLayout } from '>/types';

type PageSizeSelectProps = {
  id?: string;
  label?: string;
  wrapLayout?: WrapLayout;
  wrapClass?: string;
  onChange: (size: number) => void;
  selectedSize: number;
};
export const PageSizeSelect = ({
  id,
  label,
  onChange,
  selectedSize,
  wrapLayout,
  wrapClass,
}: PageSizeSelectProps) => {
  const setPageSize = (v: string | string[]) => {
    onChange(Number(v));
  };
  return (
    <>
      <ComboField
        id={id ?? 'select-page-size'}
        label={label ?? '-'}
        value={selectedSize.toString()}
        onChange={setPageSize}
        $options={pageSizeValues.map((s) => ({
          label: s.toString(),
          value: s.toString(),
        }))}
        wrapLayout={wrapLayout}
        wrapClass={wrapClass}
        $placeholder='Number of Rows/Page'
      />
    </>
  );
};
