import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon, RotateCcwIcon } from 'lucide-react';
import { queriesStoreActions, useDialogStore } from '>/services/stores';
import { useModal } from '>/services/hooks';
import { MIN_QUERY_CHARS, groupByModes, cx } from '>/services/utils';
import {
  ComboField,
  CheckboxField,
  TextAreaField,
  InputField,
  DatabaseCombo,
  DialogContent,
  QueryErrorDetails,
} from '>/modules';
import { routes } from '>/config';
import { SqlQueryModes } from '>/contracts';
import { QueryItem, CommonDialogHandlers } from '>/types';

type QueryRequestAreaProps = {
  formHandlers: CommonDialogHandlers;
  queryTitle?: string;
};

export const QueryRequestArea = ({
  formHandlers,
  queryTitle = '',
}: QueryRequestAreaProps) => {
  const [title, setTitle] = useState<string>(queryTitle);
  const existingQuery = queriesStoreActions.getQuery(queryTitle);
  const [multi, setMulti] = useState(existingQuery?.multi ?? false);
  const [query, setQuery] = useState(existingQuery?.query ?? '');
  const [selectedDatabase, setSelectedDatabase] = useState(
    existingQuery?.database ?? '',
  );

  const mode = queriesStoreActions.getQuery(queryTitle)?.mode ?? 'default';
  const [queryMode, setQueryMode] = useState<SqlQueryModes>(mode);

  const { setButtonStatus } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const { errorResponse, clearError } = useDialogStore(({ state, api }) => ({
    errorResponse: state.response,
    clearError: api.clearError,
  }));

  const onConfirm = () => {
    const values: QueryItem = {
      title,
      query,
      database: selectedDatabase.length > 0 ? selectedDatabase : undefined,
      multi: multi ? multi : undefined,
      mode: queryMode,
    };
    queriesStoreActions.addQuery(values);
    if (location.pathname !== routes.front.queryView) {
      navigate(routes.front.queryView);
    }
  };

  const onClearArea = () => {
    setQuery('');
  };
  const onResetDatabase = () => {
    setSelectedDatabase('');
  };

  const handleError = () => {
    clearError();
  };

  useEffect(() => {
    const disabled = query.trim().length < MIN_QUERY_CHARS || errorResponse;
    setButtonStatus('confirm', disabled ? 'disabled' : undefined);
  }, [selectedDatabase, title, query, queryMode, errorResponse]);

  useEffect(() => {
    formHandlers.confirm = onConfirm;
  }, [onConfirm]);

  return (
    <div className='area-container'>
      {errorResponse && (
        <div className='animate-top-slide overflow-hidden border-b border-t'>
          <DialogContent
            className='animate-in zoom-in-95 duration-300'
            classSpacer='caption error'
            note='Query execution failed'
            onClose={handleError}
          >
            <QueryErrorDetails error={errorResponse} />
          </DialogContent>
        </div>
      )}
      <div
        className={cx(
          'wrapper max min-h-0 transition-all duration-300',
          errorResponse && 'opacity-40 pointer-events-none',
        )}
      >
        <div className='area-spacer'>
          <h1 className='area-title'>Run Raw Query</h1>
          <div className='area-actions'>
            <div className='btn-group'>
              <button
                type='button'
                className='btn-secondary'
                onClick={onResetDatabase}
                title='Do not use database'
                disabled={selectedDatabase === ''}
              >
                <RotateCcwIcon size={24} />
              </button>
              <button
                type='button'
                className='btn-secondary'
                onClick={onClearArea}
                title='Clear Query'
                disabled={query === ''}
              >
                <DeleteIcon size={24} />
              </button>
            </div>
          </div>
        </div>
        <div className='area-content'>
          <div className='wrapper space-y-1'>
            <InputField
              id='query-title'
              label='Title:'
              value={title}
              title='When is named it will save the query'
              onChange={(e) => {
                const value = e.currentTarget.value;
                setTitle(value);
                // query.length >= MIN_QUERY_CHARS && setButtonStatus('confirm');
              }}
            />
          </div>
          <div className='wrapper space-y-1'>
            <DatabaseCombo
              selectedDatabase={selectedDatabase}
              onChange={setSelectedDatabase}
            />
          </div>
          <div className='full wrapper space-y-1'>
            <TextAreaField
              id='query-sql'
              label='Query SQL:'
              className='text-dialog-area resize-none input border'
              wrapClass='h-full'
              value={query}
              onChange={(v) => {
                const value = v.currentTarget.value;
                // const disabled = value.length < MIN_QUERY_CHARS;
                // setButtonStatus('confirm', disabled ? 'disabled' : undefined);
                setQuery(value);
              }}
            />
          </div>
          <div className='wrapper space-y-1'>
            <CheckboxField
              checked={multi}
              onChange={(value) => {
                setMulti(value);
              }}
              id={`multi-statements`}
              label='Multi-Statement Query'
            />
          </div>
          <div className='wrapper space-y-1'>
            <ComboField
              label='Query Mode:'
              id='select-groupby-mode'
              value={queryMode}
              onChange={(v) => setQueryMode(v as SqlQueryModes)}
              $options={groupByModes.map((mode) => ({ ...mode }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
