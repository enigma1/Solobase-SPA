import { PageListings } from '>/services/utils/appSettings';

export type ItemPreferenceProps = {
  onModify: (tempSettings: Partial<StorageConfig>) => void;
  modified: StorageConfig;
};

export type SidebarVisibilityType = {
  sideDatabases: boolean;
  sideTables: boolean;
  sideQueries: boolean;
};
export type SidebarOptions = keyof SidebarVisibilityType;
export type StorageConfig = {
  hiddenColumns: Record<string, boolean>;
  sidebarVisibility: SidebarVisibilityType;
  headerVisibility: boolean;
  theme: string;
  sidebarWidth: number;
  backend: string;
  frontPort: number;
  pageSizes: Record<PageListings, number>;
};
