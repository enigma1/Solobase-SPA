import { SyntheticEvent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon, RotateCcwIcon } from 'lucide-react';
import { useModal } from '>/services/hooks';
import {
  messageStoreActions,
  accountStoreActions,
  historyStoreActions,
} from '>/services/stores';
import { useDatabases, useImportDataMutation } from '>/services/queryHooks';
import {
  ScreenLoader,
  ComboField,
  TextAreaField,
  DropFileField,
} from '>/modules';
import { MIN_QUERY_CHARS, sqlStringConvert } from '>/services/utils';
import { routes } from '>/config';
import { CommonDialogHandlers } from '>/types';

type ImportDataAreaProps = {
  formHandlers: CommonDialogHandlers;
};

export const ImportDataArea = ({ formHandlers }: ImportDataAreaProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [rawData, setRawData] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setButtonStatus } = useModal();

  const { isFetching, dbNames } = useDatabases(({ api, query }) => {
    return {
      dbNames: api.getDbNames(),
      isSuccess: query.isSuccess,
      isError: query.isError,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
    };
  });

  useEffect(() => {
    return () => {
      console.log('Import dialog unmounted');
    };
  }, []);

  const importDataCallbacks = {
    onSuccess: (data: any) => {
      accountStoreActions.setActiveDatabase(null, true);
      if (!data.ok) {
        messageStoreActions.addMessage({
          type: 'warn',
          content: { text: 'Importing data had issues', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Data imported successfully', duration: 3000 },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to execute query', duration: 3000 },
      });
    },
  };

  const { mutate, mutateAsync, isPending, response } = useImportDataMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      mutateAsync: api.mutateAsync,
      response: state,
    }),
    importDataCallbacks,
  );

  useEffect(() => {
    if (file || rawData.length > MIN_QUERY_CHARS) setButtonStatus('confirm');
  }, [file, rawData]);

  const onClearArea = () => {
    setRawData('');
  };
  const onResetDatabase = () => {
    setSelectedDatabase('');
  };

  const onConfirm = async () => {
    let sql;

    if (file) {
      sql = await sqlStringConvert(file);
    } else {
      sql = rawData;
    }

    if (!sql || sql.length < MIN_QUERY_CHARS) {
      messageStoreActions.addMessage({
        content: { text: 'Invalid file specified', duration: 3000 },
      });
      return;
    }

    mutate({
      database: selectedDatabase,
      data: sql,
    });

    historyStoreActions.setLastImport(sql);

    if (location.pathname !== routes.front.textView) {
      navigate(routes.front.textView);
    }
  };

  // Do not close this dialog when the file dialog closes
  const onClose = (e?: SyntheticEvent<HTMLDialogElement>) => {
    e?.preventDefault();
  };

  useEffect(() => {
    formHandlers.confirm = onConfirm;
    formHandlers.close = onClose;
  }, [formHandlers, onConfirm, onClose]);

  const isBusy = isFetching || isPending;

  if (isBusy) {
    return <ScreenLoader />;
  }

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Import Data</h1>
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
              disabled={rawData === ''}
            >
              <DeleteIcon size={24} />
            </button>
          </div>
        </div>
      </div>
      <div className='area-content'>
        <div className='flex flex-col space-y-1'>
          <ComboField
            label='Database:'
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
        <div className='flex flex-col space-y-1'>
          <DropFileField
            value={file}
            onValueChange={setFile}
            containerProps={{
              className: 'test',
            }}
            inputProps={{
              accept: '.sql,.gz,.sql.gz',
            }}
            texts={{
              title: 'Drop SQL data file here',
              subtitle: 'or browse for a file',
              browseButton: 'Browse...',
              replaceButton: 'Replace File',
              removeButton: 'Clear',
            }}
          />
        </div>
        <div className='flex flex-col space-y-1 w-full h-full'>
          <TextAreaField
            id='raw-data'
            label='Raw Data:'
            className='text-dialog-area resize-none input border'
            wrapClass='h-full'
            defaultValue={rawData}
            onChange={(v) => {
              const value = v.currentTarget.value;
              setRawData(value);
            }}
          />
        </div>
      </div>
    </div>
  );
};
