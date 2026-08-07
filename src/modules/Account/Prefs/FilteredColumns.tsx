import cloneDeep from 'lodash-es/cloneDeep';
import { useEffect } from 'react';
import { useConfigStore, useColumnsStore } from '>/services/stores';
import { MiniTable, CheckboxField } from '>/modules';
import { ItemPreferenceProps, FilterColumnParams } from '>/types';
import { filterDataActionOptions } from '>/services/utils';

export const FilteredColumns = ({
  modified,
  onModify,
  triggerSave,
}: ItemPreferenceProps) => {
  const { pastColumnsActions, getFilters, restorePastColumnsActions } =
    useColumnsStore(({ api, state }) => ({
      pastColumnsActions: state.pastColumnsActions,
      getFilters: api.getFilters,
      updatePastColumnsActions: api.updatePastColumnsActions,
      restorePastColumnsActions: api.restorePastColumnsActions,
    }));

  const { savePreferences } = useConfigStore(({ api }) => ({
    savePreferences: api.savePreferences,
  }));
  const filters = getFilters();

  useEffect(() => {
    if (triggerSave > 0) {
      savePreferences({
        pastColumnsActions: modified.pastColumnsActions,
      });
      restorePastColumnsActions(modified.pastColumnsActions);
    }
  }, [triggerSave]);

  // Branches
  const filteredColumnsList = Object.keys(filters);
  if (filteredColumnsList.length === 0) {
    return <span className='stand'>No Filtered Columns</span>;
  }

  const getActionValue = (filter: FilterColumnParams | undefined) => {
    if (!filter) {
      return 'not set';
    }

    if (filter.mode === 'distinct' || filter.mode === 'groupBy') {
      return 'set';
    }

    if (typeof filter.value === 'string') {
      if (filter.value === '') {
        return 'empty value';
      }

      if (/^\s+$/.test(filter.value)) {
        return `spaces (${filter.value.length})`;
      }

      return filter.value;
    }

    return String(filter.value ?? 'not set');
  };
  const actionRows = filteredColumnsList.map((colName) => {
    const columnFilters = filters[colName];

    const row = filterDataActionOptions.map(({ action }) => {
      const filter = columnFilters.find((f) => f.mode === action);

      return getActionValue(filter);
    });

    return {
      uiKey: colName,
      row,
    };
  });

  const selectedRows = Object.fromEntries(
    filteredColumnsList.map((colName) => [
      colName,
      !!modified.pastColumnsActions[colName]?.filters?.length,
    ]),
  );

  const columnsOrder = filterDataActionOptions.map((c) => c.option);

  const modFilteredColumns = modified.pastColumnsActions;
  const hasModedFilters = Object.values(modFilteredColumns).some(
    (e) => !!e.filters,
  );

  const handleRowSelect = (uiKey: string, enabled: boolean) => {
    const updatedActions = cloneDeep(modified.pastColumnsActions);

    if (enabled) {
      updatedActions[uiKey] = cloneDeep(pastColumnsActions[uiKey]);
    } else {
      if (updatedActions[uiKey]) {
        delete updatedActions[uiKey].filters;

        if (!updatedActions[uiKey].sort) {
          delete updatedActions[uiKey];
        }
      }
    }

    onModify({
      pastColumnsActions: updatedActions,
    });
  };

  const clearAllFilters = () => {
    const updatedActions = cloneDeep(pastColumnsActions);

    Object.keys(updatedActions).forEach((colName) => {
      delete updatedActions[colName].filters;

      if (!updatedActions[colName].sort) {
        delete updatedActions[colName];
      }
    });

    return updatedActions;
  };
  const handleAllFilters = (checked: boolean) => {
    onModify({
      pastColumnsActions: checked
        ? clearAllFilters()
        : cloneDeep(pastColumnsActions),
    });
  };

  return (
    <>
      <p className='p-2 field-warn-bg stand'>
        The following lists columns that are filtered in Data Rows of Tables.
        Deselect the checboxes to remove them.
      </p>
      <div className='wrapper'>
        <MiniTable
          rows={actionRows}
          columnsOrder={columnsOrder}
          extraClassName='w-fit'
          selectedRows={selectedRows}
          onSelectRow={handleRowSelect}
        />
        <div className='focus-line px-3 py-2'>
          <CheckboxField
            checked={!hasModedFilters}
            onChange={handleAllFilters}
            id='all-moded-filters'
            label='Tick to clear all filters'
          />
        </div>
      </div>
    </>
  );
};
