import { tableColumnTypes } from './db';
import { hasit } from './strings';
import {
  SqlColumnsShape,
  FilterColumnParams,
  SortByParams,
  ColumnActions,
} from '>/types';

type BuildColumnActionsProps = {
  columnsOrder: string[];
  cols: SqlColumnsShape;
  sortBy: Record<string, SortByParams>;
  filters: Record<string, FilterColumnParams[]>;
};

export const buildColumnActions = ({
  columnsOrder,
  cols,
  sortBy,
  filters,
}: BuildColumnActionsProps): Record<string, ColumnActions> => {
  const result: Record<string, ColumnActions> = {};

  for (const colName of columnsOrder) {
    const colData = cols[colName];
    const storedSort = sortBy[colName];

    const typeGroup = tableColumnTypes.find((group) =>
      hasit({
        input: colData.type,
        parts: group.options.map((option) => option.value),
      }),
    );

    if (!typeGroup) continue;

    const actions: ColumnActions = {
      type: colData.type,
    };

    if (storedSort) {
      actions.sort = storedSort.direction;
    } else if (typeGroup.meta?.sortable) {
      actions.sort = 'both';
    }

    const storedFilters = filters[colName];

    if (storedFilters?.length) {
      actions.filter = storedFilters[storedFilters.length - 1];
    }

    result[colName] = actions;
  }

  return result;
};
