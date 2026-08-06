import { PageListings } from '>/services/utils/appSettings';
import {
  SortDirection,
  FilterColumnParams,
  ColumnActions,
  SqlRow,
  QueryItem,
  SortByParams,
} from './db';

export type SidebarVisibilityTypes = {
  sideDatabases: boolean;
  sideTables: boolean;
  sideQueries: boolean;
};
export type SidebarOptions = keyof SidebarVisibilityTypes;

export type StoredColumnActions = {
  type: string;
  filters?: FilterColumnParams[];
  sort?: SortDirection;
};

export type StorageConfig = {
  frontPort: number;
  backPort: number;
  hiddenColumns: Record<string, boolean>;
  sidebarVisibility: SidebarVisibilityTypes;
  headerVisibility: boolean;
  allowSystemDatabases: boolean;
  objectEditorForJson: boolean;
  theme: string;
  sidebarWidth: number;
  pageSizes: Record<PageListings, number>;
  pastColumnsActions: Record<string, StoredColumnActions>;
};

export type UserPrefs = StorageConfig & {
  queries: Record<string, QueryItem>;
  copiedRows: Record<string, SqlRow[]>;
};

export type ItemPreferenceProps = {
  modified: UserPrefs;
  onModify: (tempSettings: Partial<UserPrefs>) => void;
  triggerSave: number;
};
