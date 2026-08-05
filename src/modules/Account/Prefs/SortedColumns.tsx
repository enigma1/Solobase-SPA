import cloneDeep from 'lodash-es/cloneDeep';
import { useEffect } from 'react';
import { useConfigStore } from '>/services/stores';
import { ComboField } from '>/modules';
import { ItemPreferenceProps, SortSelection } from '>/types';

type SortByOption = {
  label: string;
  value: SortSelection;
};
export const SortedColumns = ({
  modified,
  onModify,
  triggerSave,
}: ItemPreferenceProps) => {
  const { getSortBy, savePreferences } = useConfigStore(({ api }) => ({
    savePreferences: api.savePreferences,
    getSortBy: api.getSortBy,
  }));

  useEffect(() => {
    if (triggerSave > 0) {
      savePreferences({
        pastColumnsActions: modified.pastColumnsActions,
      });
    }
  }, [triggerSave]);

  // console.log('past-actions', pastColumnActions);
  const sortBy = getSortBy();
  const sortOptions: SortByOption[] = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
    { label: 'None', value: 'both' },
  ];

  const handleSortBy = (colName: string, value: SortSelection) => {
    const modSortedColumns = cloneDeep(modified.pastColumnsActions);

    if (value === 'both') {
      if (modSortedColumns[colName]) {
        delete modSortedColumns[colName].sort;

        if (!modSortedColumns[colName].filters?.length) {
          delete modSortedColumns[colName];
        }
      }
    } else {
      modSortedColumns[colName] = {
        ...modSortedColumns[colName],
        sort: value,
      };
    }
    onModify({
      pastColumnsActions: modSortedColumns,
    });
  };

  const sortedColumnsList = Object.keys(sortBy);

  if (sortedColumnsList.length === 0) {
    return <span className='stand'>No Sorted Columns</span>;
  }
  return (
    <>
      <p className='p-2 field-warn-bg stand'>
        The following columns are sorted in Data Rows of Tables. Select{' '}
        <span className='field-info'>[None]</span> to remove them.
      </p>
      <div className='wrapper'>
        {sortedColumnsList.map((colName, idx) => {
          const storedAction = modified.pastColumnsActions[colName];
          const value = storedAction ? (storedAction.sort ?? 'both') : 'both';
          return (
            <div key={`${colName}-${idx}`} className='area-item'>
              <ComboField
                id={`${colName}-${idx}-'sort-by'`}
                label={`${colName}:`}
                value={value}
                onChange={(value) =>
                  handleSortBy(colName, value as SortSelection)
                }
                $options={sortOptions}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
