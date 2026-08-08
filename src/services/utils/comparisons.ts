import { SNAPSHOT_MAX_CELL_CHARS } from '>/config';
import { truncateString } from './strings';
import { SqlRow, SqlRows, SnapshotEntry, SnapshotMatch } from '>/types';

export type EqualityFn<U = any> = (a: U, b: U) => boolean;

// Base comparison types
export const comparisonTypes: Record<string, EqualityFn> = {
  objectIs: Object.is, // strict equality (use this the default comparison)
  jsonCompare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  keysCompare: (a, b) => {
    const aKeysSorted = Object.keys(a).sort();
    const bKeysSorted = Object.keys(b).sort();
    return JSON.stringify(aKeysSorted) === JSON.stringify(bKeysSorted);
  },
  shallowEqual: (a, b) => {
    if (Object.is(a, b)) return true;
    if (!a || !b) return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every((k) => Object.is(a[k], b[k]));
  },
  shallowCheckFromLeft: (a, b) =>
    Object.entries(a).every(([k, v]) => Object.is(v, b[k])),
  alwaysFail: () => {
    return false;
  },
};

// Helper to compare objects with optional type selection
export const compareObjects = (a: any, b: any, type: string = 'jsonCompare') =>
  comparisonTypes[type]?.(a, b) ?? false;

// Extend comparisonTypes dynamically
export const addComparisonType = (name: string, fn: EqualityFn) => {
  comparisonTypes[name] = fn;
};

export const cellsMatch = (snapshotValue: string, currentValue: string) => {
  if (snapshotValue.endsWith('...')) {
    return currentValue.startsWith(snapshotValue.slice(0, -3));
  }

  return snapshotValue === currentValue;
};

export const snapshotRow = (row: SqlRow): string[] =>
  row.map((value) => {
    if (value instanceof Date) {
      return truncateString(value.toISOString(), SNAPSHOT_MAX_CELL_CHARS);
    }

    if (typeof value === 'bigint') {
      return truncateString(value.toString());
    }

    if (typeof value === 'string') {
      return truncateString(value);
    }

    return truncateString(JSON.stringify(value) ?? '');
  });

export const rowMatches = (
  snapshotRow: string[],
  currentRow: string[],
): number => {
  if (!snapshotRow.length || !currentRow.length) {
    return 0;
  }

  let matches = 0;

  for (let i = 0; i < snapshotRow.length; i++) {
    if (cellsMatch(snapshotRow[i], currentRow[i])) {
      matches++;
    }
  }

  return matches / snapshotRow.length;
};

export const findMatchingSnapshot = (
  snapshots: SnapshotEntry[],
  rows: SqlRows,
): SnapshotMatch | null => {
  let bestMatch: SnapshotMatch | null = null;

  for (const snapshot of snapshots) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const currentRow = snapshotRow(rows[rowIndex]);

      const score = rowMatches(snapshot.row, currentRow);

      if (score === 1) {
        return {
          rowIndex,
          score,
          offset: snapshot.offset,
        };
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          rowIndex,
          score,
          offset: snapshot.offset,
        };
      }
    }
  }

  return bestMatch;
};
