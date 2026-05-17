import { DownloadIcon, ShrinkIcon } from 'lucide-react';
import { compactTable } from '>/services/utils';
import { useState } from 'react';

type QueryShellProps = {
  tableName: string;
  rowCount?: number;
  tableRef: React.RefObject<HTMLTableElement | null>;
  onDownload: () => void;
};

export const QueryShell = ({
  tableName,
  tableRef,
  rowCount,
  onDownload,
}: QueryShellProps) => {
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
          <button
            className='btn-secondary'
            onClick={() => {
              if (tableRef.current) {
                const nextPacked = !isPacked;
                setIsPacked(nextPacked);
                compactTable(tableRef.current, nextPacked);
              }
            }}
            title={isPacked ? 'Columns inline' : 'Pack columns'}
          >
            <ShrinkIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
