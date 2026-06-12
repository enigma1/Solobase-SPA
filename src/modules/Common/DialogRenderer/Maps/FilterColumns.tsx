import { useState } from 'react';
import { Checkbox } from '>/modules';
import { useModal } from '>/services/hooks';

type FilterColumnsProps = {
  hiddenColumns: Record<string, boolean>;
  columnsOrder: string[];
  onChange: (name: string, hide: boolean) => void;
};
export const FilterColumns = ({
  columnsOrder,
  hiddenColumns,
  onChange,
}: FilterColumnsProps) => {
  const { setButtonStatus } = useModal();
  const [localHiddenColumns, setLocalHiddenColumns] = useState(hiddenColumns);
  return (
    <div className='area-container'>
      {columnsOrder.map((col, idx) => {
        const bgStyle = idx % 2 ? 'odd' : 'even';
        return (
          <div key={`${col}-${idx}`} className={`area-item ${bgStyle}`}>
            <label key={col} className='flex items-center gap-2'>
              <Checkbox
                checked={!Boolean(localHiddenColumns[col])}
                onChange={(checked) => {
                  if (checked) {
                    const { [col]: removed, ...rest } = localHiddenColumns;
                    setLocalHiddenColumns(rest);
                  } else {
                    setLocalHiddenColumns({
                      ...localHiddenColumns,
                      [col]: true,
                    });
                  }
                  setButtonStatus('confirm');
                  onChange(col, !checked);
                }}
              />
              {col}
            </label>
          </div>
        );
      })}
    </div>
  );
};
