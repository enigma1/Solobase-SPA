import { useState } from 'react';

import {
  CaptionsIcon,
  CaptionsOffIcon,
  DownloadIcon,
  ShrinkIcon,
  LayersMinusIcon,
  RouteOffIcon,
} from 'lucide-react';
import { compactTable } from '>/services/utils';

type DatabasesShellProps = {
  dbCount?: number;
  tableRef: React.RefObject<HTMLTableElement | null>;
  hasEdits?: boolean;
  hasSelects?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onClearSelected?: () => void;
  onDelete?: () => void;
};

export const DatabaseShell = ({
  tableRef,
  dbCount,
  hasEdits,
  hasSelects,
  onDiscard,
  onSave,
  onDownload,
  onClearSelected,
  onDelete,
}: DatabasesShellProps) => {
  const [isPacked, setIsPacked] = useState(false);
  return (
    <div className='page-container'>
      <div className='page-toolbar'>
        <div className='page-title'>
          Databases:
          {dbCount != null && <span className='opacity-70'> ({dbCount})</span>}
        </div>
        <div className='page-actions'>
          <button
            className='btn-secondary'
            onClick={onDownload}
            title='Download Databases'
          >
            <DownloadIcon size={24} />
          </button>

          {hasEdits && (
            <>
              <button
                className='btn-secondary'
                onClick={onDiscard}
                title='Discard changes'
              >
                <CaptionsOffIcon size={24} />
              </button>
              <button className='btn' onClick={onSave} title='Save changes'>
                <CaptionsIcon size={24} />
              </button>
            </>
          )}
          {hasSelects && (
            <>
              <button
                className='btn-secondary'
                onClick={onClearSelected}
                title='Clear Selected'
              >
                <RouteOffIcon size={24} />
              </button>
              <button className='btn' onClick={onDelete} title='Delete Entries'>
                <LayersMinusIcon size={24} />
              </button>
            </>
          )}

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
        </div>
      </div>
    </div>
  );
};
