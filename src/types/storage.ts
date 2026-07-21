import { PageListings } from '>/services/utils/appSettings';
import { SqlRow, QueryItem, CopiedRow } from './db';

export type SidebarVisibilityTypes = {
  sideDatabases: boolean;
  sideTables: boolean;
  sideQueries: boolean;
};
export type SidebarOptions = keyof SidebarVisibilityTypes;

export type StorageConfig = {
  frontPort: number;
  backPort: number;
  hiddenColumns: Record<string, boolean>;
  sidebarVisibility: SidebarVisibilityTypes;
  headerVisibility: boolean;
  theme: string;
  sidebarWidth: number;
  pageSizes: Record<PageListings, number>;
};

export type UserPrefs = StorageConfig & {
  queries: Record<string, QueryItem>;
  copiedRows: Record<string, SqlRow[]>;
};

export type ItemPreferenceProps = {
  modified: UserPrefs;
  onModify: (tempSettings: Partial<UserPrefs>) => void;
  saveCount: number;
};
