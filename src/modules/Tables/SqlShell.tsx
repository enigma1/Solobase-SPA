import { useState } from 'react';

import {
  CaptionsIcon,
  CaptionsOffIcon,
  DownloadIcon,
  ShrinkIcon,
} from 'lucide-react';
import { compactTable } from '>/services/utils';

type SqlShellProps = {
  tableName: string;
  rowCount?: number;
  hasEdits: boolean;
  tableRef: React.RefObject<HTMLTableElement | null>;
  onDiscard: () => void;
  onSave: () => void;
  onDownload: () => void;
};

export const SqlShell = ({
  tableName,
  tableRef,
  rowCount,
  hasEdits,
  onDiscard,
  onSave,
  onDownload,
}: SqlShellProps) => {
  const [isPacked, setIsPacked] = useState(false);
  return (
    <div className='table-shell'>
      <div className='table-toolbar'>
        <div className='table-title'>
          {tableName}
          {rowCount != null && (
            <span className='opacity-70'> ({rowCount})</span>
          )}
        </div>
        <div className='table-actions'>
          <button
            className='btn-secondary'
            onClick={onDownload}
            title='Download Table'
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
