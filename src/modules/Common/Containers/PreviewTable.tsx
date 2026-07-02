import { SqlRow } from '>/types';

type PreviewTableProps = {
  rows: SqlRow[];
  columnsOrder: string[];
  extraClassName?: string;
};

export const PreviewTable = ({
  rows,
  columnsOrder,
  extraClassName,
}: PreviewTableProps) => {
  return (
    <div className='area-container'>
      <div className='area-listing'>
        <table className={`table ${extraClassName}`}>
          <thead>
            <tr>
              {columnsOrder.map((colName, cidx) => (
                <th key={`preview-th-${colName}-${cidx}`}>{colName}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => {
              const rowBg = idx % 2 === 0 ? 'even' : 'odd';

              return (
                <tr key={`preview-tr-${idx}`} className={rowBg}>
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
                      <td key={`preview-td-${idx}-${cidx}`}>{getValue()}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
