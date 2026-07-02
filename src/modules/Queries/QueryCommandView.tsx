type CommandInfo = {
  affectedRows?: number;
  insertId?: number;
  serverStatus?: number;
  warningCount?: number;
  message?: string;
};
type QueryCommandViewProps = {
  message: string;
  resultInfo: CommandInfo;
};

type ItemShape = {
  label: string;
  value?: string | number;
  show: boolean;
};

export const QueryCommandView = ({
  message,
  resultInfo,
}: QueryCommandViewProps) => {
  const items: ItemShape[] = [
    {
      label: 'Server Status',
      value: resultInfo.serverStatus,
      show: !!resultInfo.serverStatus,
    },
    {
      label: 'Rows affected',
      value: resultInfo.affectedRows,
      show: (resultInfo.affectedRows ?? 0) > 0,
    },
    {
      label: 'Insert ID',
      value: resultInfo.insertId,
      show: (resultInfo.insertId ?? 0) > 0,
    },
    {
      label: 'Warnings',
      value: resultInfo.warningCount,
      show: (resultInfo.warningCount ?? 0) > 0,
    },
  ];
  const content = '';
  return (
    <>
      <div className='page-top-container'>
        <div className='page-spacer'>
          <div className='page-title'>{`Command: ${message}`}</div>
        </div>
      </div>
      <div className='page-content'>
        <table className='table w-fit'>
          <tbody>
            {items
              .filter(({ show }) => show)
              .map(({ label, value }, idx) => {
                const rowBg = idx % 2 === 0 ? 'even' : 'odd';
                return (
                  <tr key={`cmd-tr-${idx}`} className={rowBg}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
};
