import { useHistoryStore } from '>/services/stores';
export const ImportView = () => {
  const { lastImport } = useHistoryStore(({ state }) => ({
    lastImport: state.lastImport,
  }));

  const content =
    lastImport.length > 0
      ? lastImport
      : 'No details available during the last Running/Importing data process';

  return (
    <>
      <div className='page-top-container'>
        <div className='page-spacer'>
          <div className='page-title'>Last Processed SQL</div>
        </div>
      </div>
      <div className='page-content'>
        <div className='page-section whitespace-pre-wrap'>{content}</div>
      </div>
    </>
  );
};
