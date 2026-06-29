import { useHistoryStore } from '>/services/stores';
export const TextView = () => {
  const { lastImport } = useHistoryStore(({ state }) => ({
    lastImport: state.lastImport,
  }));

  const content =
    lastImport.length > 0
      ? lastImport
      : 'No data available during the last import ';

  return (
    <>
      <div className='page-top-container'>
        <div className='page-spacer'>
          <div className='page-title'>Last Imported SQL</div>
        </div>
      </div>
      <div className='page-content'>
        <div className='page-section whitespace-pre-wrap'>{content}</div>
      </div>
    </>
  );
};
