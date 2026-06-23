import { useState, useEffect } from 'react';
import { useUtilitiesStore } from '>/services/stores';
import { CheckboxField } from '>/modules';

type HiddenColumnsProps = {
  save: boolean;
  onModify: () => void;
};
export const HiddenColumns = ({ save, onModify }: HiddenColumnsProps) => {
  const [restoredCols, setRestoredCols] = useState<Record<string, boolean>>({});
  const { hiddenColumns, savePreferences } = useUtilitiesStore(
    ({ state, api }) => ({
      hiddenColumns: state.hiddenColumns,
      savePreferences: api.savePreferences,
    }),
  );

  useEffect(() => {
    if (!save) return;

    const nextHiddenColumns = { ...hiddenColumns };

    Object.entries(restoredCols).forEach(([col, restored]) => {
      if (restored) {
        delete nextHiddenColumns[col];
      }
    });
    savePreferences({ hiddenColumns: nextHiddenColumns });
  }, [save]);

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
              checked={restoredCols[col] !== true}
              onChange={(value) => {
                setRestoredCols((cols) => {
                  value === false && onModify();
                  return {
                    ...cols,
                    [col]: !value,
                  };
                });
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
