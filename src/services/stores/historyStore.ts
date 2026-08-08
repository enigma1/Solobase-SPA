import { makeStore } from '>/services/utils/emitter';
import {
  MAX_SQL_STRING,
  MAX_COPIED_ROWS,
  MAX_SNAPSHOTS,
  SNAPSHOT_TIMEOUT,
} from '>/config';
import {
  normalizeSql,
  truncateString,
  findMatchingSnapshot,
  snapshotRow,
} from '>/services/utils';
import {
  SqlRow,
  CopiedRow,
  SqlRows,
  SnapshotEntry,
  SnapshotMatch,
} from '>/types';

type TrackingKeys = {
  database: string;
  table: string;
};

type UserTrackingAction = TrackingKeys & {
  offset: number;
  row: SqlRow;
};

type HistoryState = {
  lastImport: string;
  copiedRows: Record<string, SqlRows>;
  snapshots: Record<string, SnapshotEntry[]>;
};

const initialState: HistoryState = {
  lastImport: '',
  copiedRows: {},
  snapshots: {},
};

export type HistoryActions = {
  initialize: () => void;
  setLastImport: (sql: string) => void;
  addCopiedRow: (row: CopiedRow) => void;
  clearCopiedRows: () => void;
  getCopiedRowsList: (columnsOrder: string[]) => SqlRow[];
  getCopiedRows: () => Record<string, SqlRows>;
  setCopiedRows: (rows: Record<string, SqlRows>) => void;
  setUserSnapshot: (action: UserTrackingAction) => void;
  // getUserSnapshot: (keys: TrackingKeys, idx?: number) => SnapshotEntry | null;
  findUserSnapshot: (keys: TrackingKeys, rows: SqlRows) => SnapshotMatch | null;
};

const baseStore = makeStore<HistoryState>(() => {
  return { ...initialState };
});

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

  setUserSnapshot: (action) => {
    const key = `${action.database}.${action.table}`;
    const now = Date.now();

    setAuto((state) => {
      const existing = state.snapshots[key] ?? [];

      const valid = existing.filter(
        (snapshot) => now - snapshot.createdAt < SNAPSHOT_TIMEOUT,
      );

      const previous = valid[0];
      const row = snapshotRow(action.row);
      if (
        previous &&
        previous.offset === action.offset &&
        JSON.stringify(previous.row) === JSON.stringify(row)
      ) {
        return state;
      }

      const snapshot: SnapshotEntry = {
        offset: action.offset,
        row,
        createdAt: now,
      };

      return {
        snapshots: {
          ...state.snapshots,
          [key]: [snapshot, ...valid].slice(0, MAX_SNAPSHOTS),
        },
      };
    });
  },

  findUserSnapshot: (keys, rows) => {
    const key = `${keys.database}.${keys.table}`;
    const snapshots = get().snapshots[key];
    if (!snapshots?.length) {
      return null;
    }
    return findMatchingSnapshot(snapshots, rows);
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
