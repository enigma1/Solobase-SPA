import cloneDeep from 'lodash-es/cloneDeep';
import { hasit, makeStore, userPrefs } from '>/services/utils';
import type { SortDirection } from '>/contracts';
import type {
  SqlColumnsShape,
  StoredColumnActions,
  SortByParams,
  FilterColumnParams,
} from '>/types';

type ColumnsState = {
  hiddenColumns: Record<string, boolean>;
  pastColumnsActions: Record<string, StoredColumnActions>;
};
type UpdatePastColumnsActionsProps = {
  cols: SqlColumnsShape;
  sorts?: Record<string, SortByParams | undefined>;
  filters?: Record<string, FilterColumnParams[]>;
};
type ChangeSortByProps = {
  cols: SqlColumnsShape;
  colName: string;
  direction?: SortDirection;
};
type ChangeFilterProps = {
  cols: SqlColumnsShape;
  colName: string;
  filter: FilterColumnParams;
};

export type ColumnsActions = {
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (cols: Record<string, boolean>) => void;

  getColumnsPreferences: () => ColumnsState;
  setColumnsPreferences: (prefs: ColumnsState) => void;
  restorePastColumnsActions: (
    actions: Record<string, StoredColumnActions>,
  ) => void;
  getPastColumnsActions: (
    cols?: SqlColumnsShape,
  ) => Record<string, StoredColumnActions>;
  updatePastColumnsActions({
    cols,
    sorts,
    filters,
  }: UpdatePastColumnsActionsProps): void;
  changeSortBy: (changes: ChangeSortByProps) => void;
  changeFilter: (changes: ChangeFilterProps) => void;
  getSortBy: (cols?: SqlColumnsShape) => Record<string, SortByParams>;
  getFilters: (cols?: SqlColumnsShape) => Record<string, FilterColumnParams[]>;
  clearFilters: (cols?: SqlColumnsShape) => void;
  clearSorts: (cols?: SqlColumnsShape) => void;
};

export type ColumnsStore = ColumnsState & ColumnsActions;

const initialState: ColumnsState = {
  pastColumnsActions: cloneDeep(userPrefs.pastColumnsActions),
  hiddenColumns: cloneDeep(userPrefs.hiddenColumns),
};

const baseStore = makeStore<ColumnsState>(() => ({
  ...initialState,
}));

const { get, set, setAuto } = baseStore;

export const columnsStoreActions: ColumnsActions = {
  setColumnsPreferences: (prefs) => {
    setAuto({ ...cloneDeep(prefs) });
  },
  getColumnsPreferences: () => ({
    pastColumnsActions: get().pastColumnsActions,
    hiddenColumns: get().hiddenColumns,
  }),
  getHiddenColumns: () => get().hiddenColumns,
  setHiddenColumns: (cols) => {
    setAuto({ hiddenColumns: cols });
  },

  changeSortBy({ cols, colName, direction }) {
    columnsStoreActions.updatePastColumnsActions({
      cols: {
        [colName]: cols[colName],
      },
      sorts: {
        [colName]: direction ? { direction } : undefined,
      },
    });
  },

  changeFilter({ cols, colName, filter }) {
    columnsStoreActions.updatePastColumnsActions({
      cols: {
        [colName]: cols[colName],
      },
      filters: {
        [colName]: [filter],
      },
    });
  },

  restorePastColumnsActions: (pastColumnsActions) => {
    setAuto({
      pastColumnsActions: cloneDeep(pastColumnsActions),
    });
  },

  clearSorts: (cols) => {
    const all = cloneDeep(get().pastColumnsActions);

    const targetColumns = cols ? Object.keys(cols) : Object.keys(all);

    for (const col of targetColumns) {
      if (!all[col]) continue;

      delete all[col].sort;

      if (!all[col].filters) {
        delete all[col];
      }
    }

    setAuto({
      pastColumnsActions: all,
    });
  },

  clearFilters: (cols) => {
    const all = cloneDeep(get().pastColumnsActions);

    const targetColumns = cols ? Object.keys(cols) : Object.keys(all);

    for (const col of targetColumns) {
      if (!all[col]) continue;

      delete all[col].filters;

      if (!all[col].sort) {
        delete all[col];
      }
    }

    setAuto({
      pastColumnsActions: all,
    });
  },

  updatePastColumnsActions: ({ cols, sorts, filters }) => {
    const all = cloneDeep(get().pastColumnsActions);

    // Current table's matching preferences
    const current = columnsStoreActions.getPastColumnsActions(cols);

    // Apply sorts
    if (sorts) {
      // Clear sorts for cols set passed
      if (Object.keys(sorts).length === 0) {
        // Clear all sorts for the columns in this update scope
        for (const col of Object.keys(cols)) {
          if (!current[col]) continue;

          delete current[col].sort;

          if (!current[col].filters) {
            delete current[col];
          }
        }
      } else {
        // Apply specific sort changes
        for (const col of Object.keys(sorts)) {
          const sort = sorts[col];

          if (sort) {
            current[col] = {
              ...current[col],
              type: cols[col].type,
              sort: sort.direction,
            };
          } else {
            if (!current[col]) continue;

            delete current[col].sort;

            if (!current[col].filters) {
              delete current[col];
            }
          }
        }
      }
    }

    // Apply filters
    // - undefined: don't modify filters
    // - {}: clear filters for all cols specified as argument passed
    // - { col: [] }: clear filters for a specific column
    // - { col: [...] }: update filters for column
    if (filters) {
      // Clear filters for cols set passed
      if (Object.keys(filters).length === 0) {
        // Clear all filters for the columns in this update scope
        for (const col of Object.keys(cols)) {
          if (!current[col]) continue;

          delete current[col].filters;

          if (!current[col].sort) {
            delete current[col];
          }
        }
      } else {
        // Apply specific filter changes
        for (const col of Object.keys(filters)) {
          current[col] ??= {
            type: cols[col].type,
          };

          const currentColumnFilters = current[col].filters ?? [];
          let processed = [...currentColumnFilters];

          for (const filter of filters[col] ?? []) {
            if (filter.value !== undefined) {
              processed = [
                ...processed.filter((f) => f.mode !== filter.mode),
                filter,
              ];
            } else {
              processed = processed.filter((f) => f.mode !== filter.mode);
            }
          }

          if (processed.length) {
            current[col] = {
              ...current[col],
              type: cols[col].type,
              filters: processed,
            };
          } else {
            delete current[col].filters;

            if (!current[col].sort) {
              delete current[col];
            }
          }
        }
      }
    }

    // Merge back into the global preferences
    for (const col of Object.keys(cols)) {
      if (current[col]) {
        all[col] = current[col];
      } else {
        delete all[col];
      }
    }

    setAuto({
      pastColumnsActions: all,
    });
  },
  getPastColumnsActions: (cols) => {
    const pastColumns = get().pastColumnsActions;
    if (!cols) {
      return pastColumns;
    }
    const hiddenColumns = get().hiddenColumns;
    const filteredColumns = Object.keys(cols).filter((c) => !hiddenColumns[c]);

    return filteredColumns.reduce(
      (acc, cName) => {
        const stored = pastColumns[cName];

        if (
          !stored ||
          !hasit({
            input: cols[cName].type,
            parts: [stored.type],
          })
        ) {
          return acc;
        }

        acc[cName] = stored;

        return acc;
      },
      {} as Record<string, StoredColumnActions>,
    );
  },
  getSortBy: (cols) => {
    const pastColumns = get().pastColumnsActions;
    const columns = cols
      ? Object.keys(cols).filter((c) => !get().hiddenColumns[c])
      : Object.keys(pastColumns);

    return columns.reduce(
      (acc, column) => {
        const stored = pastColumns[column];

        if (!stored) {
          return acc;
        }

        if (
          cols &&
          !hasit({
            input: cols[column].type,
            parts: [stored.type],
          })
        ) {
          return acc;
        }

        if (stored.sort) {
          acc[column] = {
            direction: stored.sort,
          };
        }

        return acc;
      },
      {} as Record<string, SortByParams>,
    );
  },
  getFilters: (cols) => {
    const pastColumns = get().pastColumnsActions;
    const columns = cols
      ? Object.keys(cols).filter((c) => !get().hiddenColumns[c])
      : Object.keys(pastColumns);

    return columns.reduce(
      (acc, column) => {
        const stored = pastColumns[column];

        if (!stored) {
          return acc;
        }

        if (
          cols &&
          !hasit({
            input: cols[column].type,
            parts: [stored.type],
          })
        ) {
          return acc;
        }

        if (stored.filters?.length) {
          acc[column] = stored.filters;
        }

        return acc;
      },
      {} as Record<string, FilterColumnParams[]>,
    );
  },
};

type SelectorProps = {
  state: ColumnsState;
  api: ColumnsActions;
};
export const useColumnsStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = columnsStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
