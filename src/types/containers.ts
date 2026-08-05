import { ColumnQueryMode } from './db';

export type PageTableShellActions = {
  onDiscardEdits?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  onFilterColumns?: () => void;
  onBack?: () => void;
};

export type PagingContext = {
  hasNext: boolean;
  hasPrevious: boolean;
  onPageSize: (size: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentSize: number;
};

export type ActionOptions = {
  option: string;
  action: ColumnQueryMode;
};
