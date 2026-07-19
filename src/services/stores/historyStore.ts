import { makeStore } from '>/services/utils/emitter';
import {
  normalizeSql,
  truncateString,
  MAX_SQL_STRING,
  MAX_COPIED_ROWS,
} from '>/services/utils';
import { SqlRow, CopiedRow } from '>/types';

type HistoryState = {
  lastImport: string;
  copiedRows: Record<string, SqlRow[]>;
};

const initialState: HistoryState = {
  lastImport: '',
  copiedRows: {},
};

export type HistoryActions = {
  initialize: () => void;
  setLastImport: (sql: string) => void;
  addCopiedRow: (row: CopiedRow) => void;
  clearCopiedRows: () => void;
  getCopiedRowsList: (columnsOrder: string[]) => SqlRow[];
  getCopiedRows: () => Record<string, SqlRow[]>;
  setCopiedRows: (rows: Record<string, SqlRow[]>) => void;
};

const baseStore = makeStore<HistoryState>(() => initialState);
const { get, setAuto } = baseStore;

export const historyStoreActions: HistoryActions = {
  initialize: () => {
    setAuto({ ...initialState });
  },
  setLastImport: (rawSql) => {
    const normalizedSql = normalizeSql(rawSql);
    const sql = truncateString(normalizedSql, MAX_SQL_STRING);
    setAuto({ lastImport: sql });
  },
  addCopiedRow: (cr: CopiedRow) => {
    const rowKey = JSON.stringify(cr.row);
    const key = JSON.stringify(cr.columnsOrder);

    setAuto((next) => ({
      ...next,
      copiedRows: {
        ...next.copiedRows,
        [key]: [
          cr.row,
          ...(next.copiedRows[key] ?? []).filter(
            (r) => JSON.stringify(r) !== rowKey,
          ),
        ].slice(0, MAX_COPIED_ROWS),
      },
    }));
  },
  getCopiedRowsList: (columnsOrder: string[]) => {
    const key = JSON.stringify(columnsOrder);
    return get().copiedRows[key] ?? [];
  },
  getCopiedRows: () => {
    return get().copiedRows;
  },
  setCopiedRows: (rows) => {
    setAuto({ copiedRows: rows });
  },

  clearCopiedRows: () => {
    setAuto({ copiedRows: {} });
  },
};

type SelectorArgsType = {
  state: HistoryState;
  api: HistoryActions;
};
export const useHistoryStore = <TSelected = HistoryState>(
  selector?: (args: SelectorArgsType) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = historyStoreActions;
  return selector ? selector({ state, api }) : ({ state, api } as TSelected);
};
