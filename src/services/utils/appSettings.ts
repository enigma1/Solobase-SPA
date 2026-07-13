import { z } from 'zod';

const noTrim = (name: string) =>
  z
    .string()
    .refine(
      (v) => v === v.trim(),
      `${name} must not contain leading or trailing whitespace`,
    );

const HiddenColumnsSchema = z
  .record(z.string(), z.boolean())
  .refine((obj) => Object.keys(obj).length <= 500, 'Too many hidden columns');

const SidebarVisibilitySchema = z.object({
  sideDatabases: z.boolean(),
  sideTables: z.boolean(),
  sideQueries: z.boolean(),
});

const AppInfoConfigSchema = z.object({
  storageVersion: noTrim('storageVersion').min(1),
  appVersion: noTrim('appVersion').min(6),
  buildDate: z.coerce.date(),
});

const AppSettingsConfigSchema = z.object({
  maxSqlString: z
    .int()
    .min(4)
    .max(1024 * 4096),
  maxTextString: z
    .int()
    .min(4)
    .max(1024 * 1024),
  minQueryChars: z
    .int()
    .min(4)
    .max(1024 * 1024),
  maxTableColumns: z.int().min(1).max(256),
  maxTableKeys: z.int().min(1).max(64),
  maxColumnsPerKey: z.int().min(1).max(16),
  queryTimeout: z
    .int()
    .min(3000)
    .max(1000 * 3600),
});

export const pageSizeValues = [5, 25, 50, 100, 250] as const;
export const pListings = [
  'userRows',
  'dbRows',
  'tableRows',
  'dataRows',
  'queryRows',
] as const;

const PageListingsSchema = z.enum(pListings);
const PageSizeSchema = z.union(pageSizeValues.map((size) => z.literal(size)));

export type PageListings = (typeof pListings)[number];
export const UserPrefsConfigSchema = z.object({
  backend: z.url(),
  frontPort: z.number().int().min(1).max(65535),
  theme: noTrim('theme').min(1).max(256),
  hiddenColumns: HiddenColumnsSchema,
  headerVisibility: z.boolean(),
  sidebarWidth: z.int().min(10).max(1024),
  sidebarVisibility: SidebarVisibilitySchema,
  pageSizes: z.record(PageListingsSchema, PageSizeSchema),
});

export const AppConfigSchema = z.object({
  userPrefs: UserPrefsConfigSchema,
  appSettings: AppSettingsConfigSchema,
  appInfo: AppInfoConfigSchema,
});

const raw = (window as any).APP_CONFIG;
const validated = AppConfigSchema.parse(raw);
export const userPrefs = Object.freeze(validated.userPrefs);
export const appSettings = Object.freeze(validated.appSettings);
export const appInfo = Object.freeze(validated.appInfo);
