import { makeStore } from '>/services/utils/emitter';
import { normalizeSql, truncateString, MAX_SQL_STRING } from '>/services/utils';

export type HistoryState = {
  lastImport: string;
};

const initialState: HistoryState = {
  lastImport: '',
};

export type HistoryActions = {
  initialize: () => void;
  setLastImport: (sql: string) => void;
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
