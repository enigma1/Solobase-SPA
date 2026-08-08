import { SqlRow } from './db';

export type SnapshotMatch = {
  rowIndex: number;
  score: number;
  offset: number;
};

export type SnapshotEntry = {
  offset: number;
  row: string[];
  createdAt: number;
};
