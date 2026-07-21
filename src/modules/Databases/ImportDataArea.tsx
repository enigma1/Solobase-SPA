import { SyntheticEvent, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon, RotateCcwIcon } from 'lucide-react';
import { useModal } from '>/services/hooks';
import { messageStoreActions, historyStoreActions } from '>/services/stores';
import { useDatabases, useImportDataWrap } from '>/services/queryHooks';
import {
  ScreenLoader,
  ComboField,
  TextAreaField,
  DropFileField,
} from '>/modules';
import {
  MIN_QUERY_CHARS,
  sqlStringConvert,
  groupByModes,
} from '>/services/utils';
import { dbApi } from '>/services/api';
import { routes } from '>/config';
import { SqlQueryModes, CommonDialogHandlers } from '>/types';
import { DatabaseCombo } from './DatabaseCombo';

type ImportDataAreaProps = {
  formHandlers: CommonDialogHandlers;
};

export const ImportDataArea = ({ formHandlers }: ImportDataAreaProps) => {
  const controllerRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [rawData, setRawData] = useState<string>('');
  const [groupByMode, setGroupByMode] = useState<SqlQueryModes>('default');
  const navigate = useNavigate();
  const location = useLocation();
  const { setButtonStatus } = useModal();

  const { isFetching, dbNames } = useDatabases({}, ({ api, query }) => {
    return {
      dbNames: api.getDbNames(),
      isSuccess: query.isSuccess,
      isError: query.isError,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
    };
  });

  const { mutate, mutateAsync, isPending, response } = useImportDataWrap({
    ctrl: controllerRef,
  });

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

    const confirmAsync = async () => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      await mutateAsync({
        database: selectedDatabase,
        data: sql,
        groupByMode,
      });
      historyStoreActions.setLastImport(sql);
    };
    await confirmAsync();

    if (location.pathname !== routes.front.importView) {
      navigate(routes.front.importView);
    }
  };

  const onAbort = async () => {
    await dbApi.abort();
    controllerRef.current?.abort();
  };

  // Do not close this dialog when the file dialog closes
  const onClose = (e?: SyntheticEvent<HTMLDialogElement>) => {
    e?.preventDefault();
    controllerRef.current?.abort();
  };

  useEffect(() => {
    formHandlers.confirm = onConfirm;
    formHandlers.close = onClose;
  }, [formHandlers, onConfirm, onClose]);

  const isBusy = isFetching || isPending;

  if (isBusy) {
    return (
      <ScreenLoader>
        <button className='btn-secondary space-y-1' onClick={onAbort}>
          Abort
        </button>
      </ScreenLoader>
    );
  }

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Import Data / Run Script</h1>
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
        <div className='wrapper space-y-1'>
          {/* <ComboField
            label='Database:'
            id='select-database'
            value={selectedDatabase}
            onChange={(v) => setSelectedDatabase(v as string)}
            $options={dbNames.map((name: string) => ({
              value: name,
              label: name,
            }))}
            $placeholder='Select Database'
          /> */}
          <DatabaseCombo
            selectedDatabase={selectedDatabase}
            onChange={setSelectedDatabase}
          />
        </div>
        <div className='wrapper space-y-1'>
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
        <div className='wrapper space-y-1 w-full h-full'>
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
        <div className='wrapper space-y-1'>
          <ComboField
            id='select-groupby-mode'
            label='Query Mode:'
            value={groupByMode}
            onChange={(v) => setGroupByMode(v as SqlQueryModes)}
            $options={groupByModes.map((mode) => ({ ...mode }))}
          />
        </div>
      </div>
    </div>
  );
};
