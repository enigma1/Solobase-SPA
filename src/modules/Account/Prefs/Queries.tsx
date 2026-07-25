import { useEffect } from 'react';
import { useQueriesStore } from '>/services/stores';
import { CheckboxField } from '>/modules';
import { ItemPreferenceProps } from '>/types';

export const Queries = ({
  modified,
  onModify,
  triggerSave,
}: ItemPreferenceProps) => {
  const { queries, setQueries } = useQueriesStore(({ state, api }) => ({
    queries: state.queries,
    setQueries: api.setQueries,
  }));

  const handleQueryChange = (queryTitle: string) => {
    const updatedQueries = { ...modified.queries };

    if (queryTitle in updatedQueries) {
      delete updatedQueries[queryTitle];
    } else {
      updatedQueries[queryTitle] = { ...queries[queryTitle] };
    }

    onModify({ queries: updatedQueries });
  };

  useEffect(() => {
    if (triggerSave > 0) setQueries(modified.queries);
  }, [triggerSave]);

  return (
    <>
      <p className='p-2 field-warn-bg stand'>
        Deselecting arbitrary queries will delete them when you apply the
        changes
      </p>
      <div className='wrapper'>
        {Object.keys(queries).map((q, idx) => {
          return (
            <div key={`query-prefs-${idx}`} className='area-item'>
              <CheckboxField
                checked={!!modified.queries[q]}
                onChange={() => {
                  handleQueryChange(q);
                }}
                id={`query-${q}`}
                label={q}
                labelClass='check-label full'
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
