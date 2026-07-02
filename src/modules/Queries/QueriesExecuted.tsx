import { format } from 'date-fns';
import { useQueriesStore } from '</src/services/stores';
export const QueriesExecuted = () => {
  const queriesExecuted = useQueriesStore(({ state }) => state.queriesExecuted);
  const formatTime = (ts: number) => format(new Date(ts), 'HH:mm:ss');
  return (
    <div className='area-container'>
      <div className='area-listing'>
        {queriesExecuted.map((q, idx) => {
          const bg = idx % 2 ? 'odd' : 'even';
          const sql = typeof q === 'string' ? q : q?.sql;
          return (
            <div key={`${q}-${idx}`} className={`area-item ${bg}`}>
              <div className='stand'>
                {`${q.durationMs.toFixed(2)} mSecs executed at: ${formatTime(q.startedAt)}`}
              </div>
              <div className='stand'>{sql}</div>
              {(q.params as string) && (
                <div className='stand'>{JSON.stringify(q.params)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
