import { SqlRow } from '>/types';

type PreviewTableProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};

export const PreviewTable = ({ rows, columnsOrder }: PreviewTableProps) => {
  return (
    <div className='table-wrapper'>
      <table className='table'>
        <thead>
          <tr>
            {columnsOrder.map((colName, idx) => (
              <th key={`preview-th-${colName}-${idx}`}>{colName}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => {
            const rowBg = idx % 2 === 0 ? 'even' : 'odd';

            return (
              <tr key={`preview-tr-${idx}`} className={rowBg}>
                {columnsOrder.map((_, colIndex) => {
                  const getValue = () => {
                    const value = row[colIndex];
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
                    <td key={`preview-td-${idx}-${colIndex}`}>{getValue()}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
