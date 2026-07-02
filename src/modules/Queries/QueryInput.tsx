import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircleXIcon, CircleChevronRightIcon } from 'lucide-react';
import { queriesStoreActions, accountStoreActions } from '>/services/stores';
import { MIN_QUERY_CHARS } from '>/services/utils';
import { InputField } from '>/modules';
import { routes } from '>/config/routes';

export const QueryInput = () => {
  const [query, setQuery] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  const onClear = () => {
    setQuery('');
  };

  const onSubmit = () => {
    const db = accountStoreActions.getActiveDatabase();
    const values = {
      title: '',
      query,
      database: db !== null ? db : undefined,
    };

    queriesStoreActions.addQuery(values);
    if (location.pathname !== routes.front.queryView) {
      navigate(routes.front.queryView);
    }
  };

  return (
    <>
      <InputField
        id='query-input'
        value={query}
        title='Run arbitrary sql query'
        inputClassName='pr-12'
        onChange={(e) => {
          const value = e.currentTarget.value;
          // setSaveQuery(value.length > 0);
          setQuery(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.length >= MIN_QUERY_CHARS) {
            e.preventDefault();
            onSubmit();
          }
        }}
        endAdornment={
          <div className='input-icons-group'>
            <button
              title='Clear input'
              type='button'
              onClick={onClear}
              aria-label='Clear query'
              disabled={query === ''}
            >
              <CircleXIcon size={16} />
            </button>

            <button
              title='Execute query'
              type='button'
              onClick={onSubmit}
              aria-label='Enter SQL query to execute'
              disabled={query.length < MIN_QUERY_CHARS}
            >
              <CircleChevronRightIcon size={16} />
            </button>
          </div>
        }
        placeholder='Run Query'
      />
    </>
  );
};
