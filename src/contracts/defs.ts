import { z } from 'zod';

export const sqlQueryModes = ['default', 'legacy', 'strict'] as const;
export type SqlQueryModes = (typeof sqlQueryModes)[number];

export const ScalarSchema = z.union([
  z.date(),
  z.bigint(),
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
]);

export const columnDirections = ['asc', 'desc'] as const;
export const SortDirectionSchema = z.enum(columnDirections);
export type SortDirection = (typeof columnDirections)[number];

const columnQueryModes = ['where', 'like', 'groupBy', 'distinct'] as const;

export const ColumnQueryModeSchema = z.enum(columnQueryModes);
export type ColumnQueryMode = (typeof columnQueryModes)[number];
