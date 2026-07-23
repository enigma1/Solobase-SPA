import { CheckboxField } from '>/modules';
import { SqlRow, ViewRow } from '>/types';

type MiniTableProps = {
  rows: ViewRow<SqlRow>[];
  columnsOrder: string[];
  extraClassName?: string;
  selectedRows?: Record<string, boolean>;
  onSelectRow?: (rId: string, selected: boolean) => void;
};

export const MiniTable = ({
  rows,
  columnsOrder,
  extraClassName,
  selectedRows,
  onSelectRow,
}: MiniTableProps) => {
  return (
    <table className={`table table-fixed ${extraClassName}`}>
      <thead>
        <tr>
          <th className='w-8' />
          {columnsOrder.map((colName, cidx) => (
            <th key={`mini-th-${colName}-${cidx}`}>
              <div className='truncate'>{colName}</div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map(({ row, uiKey }, idx) => {
          const rowBg = idx % 2 === 0 ? 'even' : 'odd';

          return (
            <tr
              key={`mini-tr-${idx}`}
              className={rowBg}
              onClick={() => {
                onSelectRow?.(uiKey, !(selectedRows?.[uiKey] ?? false));
              }}
            >
              <td
                className='align-middle w-8'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='flex items-center gap-2'>
                  <CheckboxField
                    wrapLayout='stack'
                    checked={selectedRows?.[uiKey] ?? false}
                    onChange={(checked) => {
                      onSelectRow?.(uiKey, checked);
                    }}
                  />
                </div>
              </td>
              {columnsOrder.map((_, cidx) => {
                const getValue = () => {
                  const value = row[cidx];
                  if (value === null) return 'NULL';
                  if (typeof value === 'object') {
                    return (
                      <pre className='whitespace-pre-wrap'>
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    );
                  }
                  if (typeof value === 'bigint') {
                    return value.toString();
                  }
                  return String(value);
                };
                return (
                  <td key={`mini-td-${idx}-${cidx}`} className='truncate'>
                    {getValue()}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
