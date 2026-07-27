import { z } from 'zod';

export const baseResponseSchema = {
  ok: z.boolean(),
  message: z.string(),
  // route: z.string(),
  // queries: z.array(z.unknown()),
};

export const basePaginationSchema = {
  paging: z
    .object({
      hasPrevious: z.boolean(),
      hasNext: z.boolean(),
    })
    .optional(),
};

export const TableShapeColumnSchema = z.object({
  // uid: z.string().min(1),
  signature: z.string().optional(),
  field: z.string().trim().min(1).max(64),
  type: z.string().trim().min(1),
  params: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  nullable: z.boolean().optional(),
  defaultValue: z.string().nullable().optional(),
  autoIncrement: z.boolean().optional(),
  unsigned: z.boolean().optional(),
  comment: z.string().optional(),
});

export const baseRowsSchema = {
  cols: z.record(z.string(), z.unknown()),
  columnsOrder: z.array(z.string()),
  rows: z.array(z.unknown()),
};

export const FetchDatabasesResponseSchema = z.object({
  ...baseResponseSchema,
  ...baseRowsSchema,
  ...basePaginationSchema,
});
