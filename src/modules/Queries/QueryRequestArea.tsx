import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon, RotateCcwIcon } from 'lucide-react';
import { messageStoreActions, dialogStoreActions } from '>/services/stores';
import { useModal } from '>/services/hooks';
import { useDatabases, useRawQueryMutation } from '>/services/queryHooks';
import { ScreenLoader, ComboBox, Checkbox } from '>/modules';
import { routes } from '>/config';
import { CommonDialogHandlers } from '>/types';

type QueryRequestAreaProps = {
  formHandlers: CommonDialogHandlers;
};
export const QueryRequestArea = ({ formHandlers }: QueryRequestAreaProps) => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [saveQuery, setSaveQuery] = useState<boolean>(false);
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

  const rawQueryCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: data.message, duration: 5000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not execute query',
            duration: 3000,
          },
        });
      }
      navigate(routes.front.queryView);
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: {
          text: error.message ?? 'Failed to execture query',
          duration: 5000,
        },
      });
    },
  };

  const { mutate, isPending, response } = useRawQueryMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    rawQueryCallbacks,
  );

  const onConfirm = () => {
    const values = {
      query,
      database: selectedDatabase.length > 0 ? selectedDatabase : undefined,
    };
    console.log('values to send', values);
    mutate(values);
  };

  const onClearArea = () => {
    setQuery('');
  };
  const onResetDatabase = () => {
    setSelectedDatabase('');
  };

  useEffect(() => {
    formHandlers.confirm = onConfirm;
  }, [onConfirm]);

  const isBusy = isFetching || isPending;

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
          <label htmlFor='query-sql'>Query SQL:</label>
          <textarea
            id='query-sql'
            className='text-dialog-area resize-none input border'
            value={query}
            onChange={(v) => {
              const value = v.currentTarget.value;
              const disabled = value.length === 0;
              setButtonStatus('confirm', disabled ? 'disabled' : undefined);
              setQuery(value);
            }}
          />
        </div>
      </div>
      <div className='area-item space-y-1'>
        <label className='check-label' htmlFor='save-query'>
          <Checkbox
            checked={saveQuery}
            onChange={() => setSaveQuery(!saveQuery)}
            id='save-query'
          />
          Save Query
        </label>
      </div>
    </div>
  );
};
