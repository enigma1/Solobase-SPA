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
  DatabaseBackupIcon,
  SquareArrowLeftIcon,
} from 'lucide-react';
import { compactTable } from '>/services/utils';
import type { FactoryTableStore } from '>/services/stores';
import { Pagination, PageSizeSelect } from '>/modules';
import { PageTableShellActions, PagingContext } from '>/types';

export type PageTableShellProps = {
  title: ReactNode;
  store: FactoryTableStore;
  actions?: PageTableShellActions;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  paging?: PagingContext;
};

export const PageTableShell = ({
  store,
  tableRef,
  actions,
  title,
  paging,
}: PageTableShellProps) => {
  const { useFactoryTableStore } = store;
  const { hasSelects, clearSelected } = useFactoryTableStore(
    ({ state, api }) => ({
      hasSelects: state.selectedRows.size > 0,
      clearSelected: api.clearSelected,
    }),
  );

  const shellActions = actions ?? {};
  const {
    onDiscardEdits,
    onSave,
    onDownload,
    onCreate,
    onDelete,
    onFilterColumns,
    onBack,
  } = shellActions;
  const [isPacked, setIsPacked] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  return (
    <>
      <div className='page-top-container'>
        <div className='page-toolbar'>
          <div className='page-title'>
            {onBack && (
              <button className='btn-micro' onClick={onBack} title='Go Back'>
                <SquareArrowLeftIcon size={18} />
              </button>
            )}
            {title}
          </div>
          <div className='page-actions'>
            {paging && (
              <div className='pagination-controls'>
                <Pagination
                  hasPrevious={paging.hasPrevious}
                  hasNext={paging.hasNext}
                  onPrevious={paging.onPreviousPage}
                  onNext={paging.onNextPage}
                />
                <PageSizeSelect
                  selectedSize={paging.currentSize}
                  onChange={paging.onPageSize}
                  wrapLayout='inline'
                />
              </div>
            )}

            {onCreate && (
              <button
                className='btn'
                onClick={onCreate}
                title='Create New Entry'
              >
                <MapPlusIcon size={24} />
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

            {onDownload && (
              <button
                className={`btn-secondary ${hasSelects && 'icon-warn'}`}
                onClick={onDownload}
                title='Export Data from all or selected Rows'
              >
                <DatabaseBackupIcon size={24} />
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
        {showNotice && (
          <div className='page-notice'>
            Notice around queries goes here if queries are present
          </div>
        )}
      </div>
    </>
  );
};
