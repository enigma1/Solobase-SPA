import { type ReactNode, useState } from 'react';

import {
  CaptionsIcon,
  CaptionsOffIcon,
  DownloadIcon,
  ShrinkIcon,
  LayersMinusIcon,
  RouteOffIcon,
  TableColumnsSplitIcon,
  MapPlusIcon,
} from 'lucide-react';
import { compactTable } from '>/services/utils';
import type { UiTableStore } from '>/services/stores';

export type PageTableShellActions = {
  onDiscardEdits?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  onFilterColumns?: () => void;
};

type PageTableShellProps = {
  title: ReactNode;
  store: UiTableStore;
  actions?: PageTableShellActions;
  tableRef?: React.RefObject<HTMLTableElement | null>;
};

export const PageTableShell = ({
  store,
  tableRef,
  actions,
  title,
}: PageTableShellProps) => {
  const { useStore } = store;
  const { hasSelects, clearSelected } = useStore(({ state, api }) => ({
    hasSelects: state.selectedRows.size > 0,
    clearSelected: api.clearSelected,
  }));

  const shellActions = actions ?? {};
  const {
    onDiscardEdits,
    onSave,
    onDownload,
    onCreate,
    onDelete,
    onFilterColumns,
  } = shellActions;
  const [isPacked, setIsPacked] = useState(false);

  return (
    <div className='page-container'>
      <div className='page-toolbar'>
        <div className='page-title'>{title}</div>
        <div className='page-actions'>
          {onCreate && (
            <button className='btn' onClick={onCreate} title='Create New Entry'>
              <MapPlusIcon size={24} />
            </button>
          )}

          {onDownload && (
            <button
              className={`btn-secondary ${hasSelects && 'icon-warn'}`}
              onClick={onDownload}
              title='Export Data from all or selected Rows'
            >
              <DownloadIcon size={24} />
            </button>
          )}
          {hasSelects && (
            <button
              className='btn-secondary'
              onClick={clearSelected}
              title='Clear Selected'
            >
              <RouteOffIcon size={24} />
            </button>
          )}
          {onDiscardEdits && (
            <button
              className='btn-secondary'
              onClick={onDiscardEdits}
              title='Discard changes'
            >
              <CaptionsOffIcon size={24} />
            </button>
          )}
          {onSave && (
            <button className='btn' onClick={onSave} title='Save changes'>
              <CaptionsIcon size={24} />
            </button>
          )}

          {onDelete && hasSelects && (
            <button
              className='btn icon-critical'
              onClick={onDelete}
              title='Delete Entries'
            >
              <LayersMinusIcon size={24} />
            </button>
          )}
          {onFilterColumns && (
            <button
              className='btn-secondary'
              onClick={onFilterColumns}
              title='Select columns'
            >
              <TableColumnsSplitIcon size={24} />
            </button>
          )}
          {tableRef && (
            <button
              title={isPacked ? 'Columns inline' : 'Pack columns'}
              className='btn-secondary'
              onClick={() => {
                if (tableRef.current) {
                  const nextPacked = !isPacked;
                  setIsPacked(nextPacked);
                  compactTable(tableRef.current, nextPacked);
                }
              }}
            >
              <ShrinkIcon size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
