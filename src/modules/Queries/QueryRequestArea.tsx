import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon, RotateCcwIcon } from 'lucide-react';
import {
  messageStoreActions,
  dialogStoreActions,
  queriesStoreActions,
} from '>/services/stores';
import { useModal } from '>/services/hooks';
import { useDatabases, useRawQueryMutation } from '>/services/queryHooks';
import {
  ScreenLoader,
  ComboBox,
  CheckboxField,
  TextAreaField,
  InputField,
} from '>/modules';
import { routes } from '>/config';
import { GroupByModes, CommonDialogHandlers } from '>/types';

const groupByModes: { label: string; value: GroupByModes }[] = [
  { label: 'Server Default', value: 'default' },
  { label: 'Legacy GroupBy', value: 'legacy' },
  { label: 'Strict GroupBy', value: 'strict' },
];
type QueryRequestAreaProps = {
  formHandlers: CommonDialogHandlers;
  queryTitle?: string;
};

export const QueryRequestArea = ({
  formHandlers,
  queryTitle = '',
}: QueryRequestAreaProps) => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [title, setTitle] = useState<string>(queryTitle);
  const [query, setQuery] = useState<string>('');
  const [groupByMode, setGroupByMode] = useState<GroupByModes>('default');
  const { setButtonStatus } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const { isFetching, dbNames } = useDatabases(({ api, query }) => {
    return {
      dbNames: api.getDbNames(),
      isSuccess: query.isSuccess,
      isError: query.isError,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
    };
  });

  const onConfirm = () => {
    const values = {
      title,
      query,
      database: selectedDatabase.length > 0 ? selectedDatabase : undefined,
      groupByMode,
    };
    queriesStoreActions.addQuery(values);
    const sel = queriesStoreActions.getSelectedQuery();
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
    if (queryTitle !== undefined) {
      const existingSql = queriesStoreActions.getQuery(queryTitle);
      if (existingSql) {
        setQuery(existingSql.query);
        existingSql.database && setSelectedDatabase(existingSql.database);
      }
    }
  }, []);

  useEffect(() => {
    formHandlers.confirm = onConfirm;
  }, [onConfirm]);

  const isBusy = isFetching; //  || isPending;

  if (isBusy) {
    return <ScreenLoader />;
  }
  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Raw Query</h1>
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
              // setSaveQuery(value.length > 0);
              setTitle(value);
              query.length >= 4 && setButtonStatus('confirm');
            }}
          />
        </div>
        <div className='flex flex-col space-y-1'>
          <label htmlFor='select-database'>Database:</label>
          <ComboBox
            id='select-database'
            value={selectedDatabase}
            onChange={(v) => setSelectedDatabase(v as string)}
            $options={dbNames.map((name: string) => ({
              value: name,
              label: name,
            }))}
            $placeholder='Select Database'
          />
        </div>
        <div className='flex flex-col space-y-1 w-full h-full'>
          <TextAreaField
            id='query-sql'
            label='Query SQL:'
            className='text-dialog-area resize-none input border'
            wrapClass='h-full'
            value={query}
            onChange={(v) => {
              const value = v.currentTarget.value;
              const disabled = value.length < 4;
              setButtonStatus('confirm', disabled ? 'disabled' : undefined);
              setQuery(value);
            }}
          />
        </div>
        <div className='flex flex-col space-y-1'>
          <label htmlFor='select-groupby-mode'>Query Group-By Mode:</label>
          <ComboBox
            id='select-groupby-mode'
            value={groupByMode}
            onChange={(v) => setGroupByMode(v as GroupByModes)}
            $options={groupByModes.map((mode) => ({ ...mode }))}
          />
        </div>

        {/* <div className='flex flex-col space-y-1 w-full h-full'>
          <label htmlFor='query-sql'>Query SQL:</label>
          <textarea
            id='query-sql'
            className='text-dialog-area resize-none input border'
            value={query}
            onChange={(v) => {
              const value = v.currentTarget.value;
              const disabled = value.length < 4;
              setButtonStatus('confirm', disabled ? 'disabled' : undefined);
              setQuery(value);
            }}
          />
        </div>
        <div className='area-item space-y-1'>
          <label className='check-label' htmlFor='save-query'>
            <CheckboxField
              checked={legacyGroupBy}
              onChange={() => setLegacyGroupBy(!legacyGroupBy)}
              id='legacy-group-by'
            />
            Enable legacy ONLY_FULL_GROUP_BY
          </label>
        </div> */}
      </div>
    </div>
  );
};
