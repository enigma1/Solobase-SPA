import { useConfigStore } from '>/services/stores';
import { CheckboxField } from '>/modules';
import { ItemPreferenceProps } from '>/types';

export const HiddenColumns = ({ modified, onModify }: ItemPreferenceProps) => {
  const { hiddenColumns } = useConfigStore(({ state }) => ({
    hiddenColumns: state.hiddenColumns,
  }));

  const modHiddenColumns = { ...modified.hiddenColumns };
  const handleColumnChange = (col: string, value: boolean) => {
    value ? (modHiddenColumns[col] = true) : delete modHiddenColumns[col];
    onModify({
      hiddenColumns: modHiddenColumns,
    });
  };

  const hiddenColumnsList = Object.keys(hiddenColumns);
  if (hiddenColumnsList.length === 0) {
    return <span className='stand'>No Hidden Columns</span>;
  }
  return (
    <>
      {Object.keys(hiddenColumns).map((col, idx) => {
        return (
          <div key={`${col}-${idx}`} className='area-item'>
            <CheckboxField
              checked={!!modHiddenColumns[col]}
              onChange={(value) => {
                handleColumnChange(col, value);
              }}
              id={`hidden-column-${idx}`}
              label={col}
            />
          </div>
        );
      })}
    </>
  );
};
