import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon, RotateCcwIcon } from 'lucide-react';
import { queriesStoreActions } from '>/services/stores';
import { useModal } from '>/services/hooks';
import { MIN_QUERY_CHARS, groupByModes } from '>/services/utils';
import {
  ScreenLoader,
  ComboBox,
  CheckboxField,
  TextAreaField,
  InputField,
  DatabaseCombo,
} from '>/modules';
import { routes } from '>/config';
import { SqlQueryModes, CommonDialogHandlers } from '>/types';

type QueryRequestAreaProps = {
  formHandlers: CommonDialogHandlers;
  queryTitle?: string;
};

export const QueryRequestArea = ({
  formHandlers,
  queryTitle = '',
}: QueryRequestAreaProps) => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [multi, setMulti] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(queryTitle);
  const [query, setQuery] = useState<string>('');
  const [groupByMode, setGroupByMode] = useState<SqlQueryModes>('default');

  const { setButtonStatus } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const onConfirm = () => {
    const values = {
      title,
      query,
      database: selectedDatabase.length > 0 ? selectedDatabase : undefined,
      multi: multi ? multi : undefined,
      groupByMode,
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

  useEffect(() => {
    const existingSql = queriesStoreActions.getQuery(queryTitle ?? '');
    if (existingSql) {
      setQuery(existingSql.query);
      existingSql.database && setSelectedDatabase(existingSql.database);
      existingSql.multi && setMulti(true);
    }
  }, []);

  useEffect(() => {
    const disabled = query.trim().length < MIN_QUERY_CHARS;
    setButtonStatus('confirm', disabled ? 'disabled' : undefined);
  }, [selectedDatabase, title, query, groupByMode]);

  useEffect(() => {
    formHandlers.confirm = onConfirm;
  }, [onConfirm]);

  return (
    <div className='area-container'>
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
        <div className='flex flex-col space-y-1'>
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
        <div className='flex flex-col space-y-1'>
          <DatabaseCombo
            selectedDatabase={selectedDatabase}
            onChange={setSelectedDatabase}
          />
        </div>
        <div className='flex flex-col space-y-1 w-full h-full'>
          <TextAreaField
            id='query-sql'
            label='Query SQL:'
            className='text-dialog-area resize-none input border'
            wrapClass='h-full'
            defaultValue={query}
            onChange={(v) => {
              const value = v.currentTarget.value;
              // const disabled = value.length < MIN_QUERY_CHARS;
              // setButtonStatus('confirm', disabled ? 'disabled' : undefined);
              setQuery(value);
            }}
          />
        </div>
        <div className='flex flex-col space-y-1'>
          <CheckboxField
            checked={multi}
            onChange={(value) => {
              setMulti(value);
            }}
            id={`multi-statements`}
            label='Multi-Statement Query'
          />
        </div>
        <div className='flex flex-col space-y-1'>
          <label htmlFor='select-groupby-mode'>Query Mode:</label>
          <ComboBox
            id='select-groupby-mode'
            value={groupByMode}
            onChange={(v) => setGroupByMode(v as SqlQueryModes)}
            $options={groupByModes.map((mode) => ({ ...mode }))}
          />
        </div>
      </div>
    </div>
  );
};
