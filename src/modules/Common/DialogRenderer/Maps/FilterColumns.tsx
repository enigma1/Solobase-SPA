import { useState } from 'react';
import { CheckboxField } from '>/modules';
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
      <p className='p-2 field-warn-bg stand'>
        Unselected columns are hidden. This selection has a global effect.
        Deselected column names will be hidden from all databases and tables.
      </p>
      <div className='area-listing'>
        {columnsOrder.map((col, idx) => {
          const bgStyle = idx % 2 ? 'odd' : 'even';
          return (
            <div key={`${col}-${idx}`} className={`area-item ${bgStyle}`}>
              <CheckboxField
                id={col}
                label={col}
                checked={!Boolean(localHiddenColumns[col])}
                onChange={(checked) => {
                  setLocalHiddenColumns((prev) => prev);
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
