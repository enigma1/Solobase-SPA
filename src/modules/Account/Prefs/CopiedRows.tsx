import { useState } from 'react';
import { useHistoryStore } from '>/services/stores';
import { CheckboxField, MiniTable } from '>/modules';
import { ItemPreferenceProps, SqlRow } from '>/types';

export const CopiedRows = ({ modified, onModify }: ItemPreferenceProps) => {
  const { copiedRows } = useHistoryStore(({ state }) => ({
    copiedRows: state.copiedRows,
  }));

  const [selectedRows, setSelectedRows] = useState<Record<string, true>>(() => {
    return Object.entries(copiedRows).reduce(
      (acc, [groupKey, rows]) => {
        rows.forEach((_, index) => {
          acc[`${index}-${groupKey}`] = true;
        });
        return acc;
      },
      {} as Record<string, true>,
    );
  });

  const handleRowGroups = (groupKey: string, checked: boolean) => {
    const nextCopiedRows = { ...modified.copiedRows };

    if (checked) {
      nextCopiedRows[groupKey] = copiedRows[groupKey];
    } else {
      delete nextCopiedRows[groupKey];
    }

    setSelectedRows((prev) => {
      const next = { ...prev };

      copiedRows[groupKey].forEach((_, index) => {
        const uiKey = `${index}-${groupKey}`;

        if (checked) {
          next[uiKey] = true;
        } else {
          delete next[uiKey];
        }
      });

      return next;
    });

    onModify({
      copiedRows: nextCopiedRows,
    });
  };

  const handleRowSelect = (uiKey: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = { ...prev };

      if (checked) {
        next[uiKey] = true;
      } else {
        delete next[uiKey];
      }

      const nextCopiedRows = Object.fromEntries(
        Object.entries(copiedRows).map(([groupKey, rows]) => [
          groupKey,
          rows.filter((_, index) => next[`${index}-${groupKey}`]),
        ]),
      );

      onModify({
        copiedRows: nextCopiedRows,
      });

      return next;
    });
  };

  const copiedRowList = Object.keys(modified.copiedRows);
  if (copiedRowList.length === 0) {
    return <span className='stand'>No Copied Rows</span>;
  }

  return (
    <>
      <p className='p-2 field-warn-bg'>
        Copied Rows matching a table's schema are shown when you insert data
        rows. Uncheck to remove.
      </p>
      <div className='wrapper gap-6'>
        {Object.entries(copiedRows).map(([columnsJson, rows], idx) => {
          const viewRows = rows.map((row, idk) => ({
            row,
            uiKey: `${idk}-${columnsJson}`,
          }));

          const columnsOrder = JSON.parse(columnsJson);
          const fit = columnsOrder.length <= 6 ? 'w-fit' : '';
          return (
            <div key={`${columnsJson}-${idx}`} className='space-y-2'>
              <MiniTable
                key={columnsJson}
                rows={viewRows}
                columnsOrder={columnsOrder}
                extraClassName={fit}
                selectedRows={selectedRows}
                onSelectRow={handleRowSelect}
              />
              <div className='focus-line px-3 py-2'>
                <CheckboxField
                  checked={modified.copiedRows[columnsJson] !== undefined}
                  onChange={(value) => handleRowGroups(columnsJson, value)}
                  id={`row-group-${idx}`}
                  label={columnsJson}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
