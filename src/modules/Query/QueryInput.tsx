import { useState, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { trimString } from '>/services/utils';
import {
  useDialogStore,
  useHistoryStore,
  useAccountStore,
} from '>/services/stores';
import {
  useQueryDataHook,
  useQueryDataMutation,
  queryKeys,
} from '>/services/queryHooks';
import { useErrorDialog } from '>/services/hooks';
import { ScreenLoader } from '>/modules';
import { routes } from '>/config/routes';

export const QueryInput = () => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { dbSelected } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
  }));
  const { addQuery, setQuerySelection } = useHistoryStore(({ state, api }) => ({
    addQuery: api.addQuery,
    setQuerySelection: api.setQuerySelection,
  }));

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ state, api }) => ({
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
      dialog: state.dialog,
    }),
  );

  // const { isSuccess, isError } = useQueryDataHook(({ state, query }) => ({
  //   isSuccess: query.isSuccess,
  //   isError: query.isError,
  // }));

  const {
    mutate: runQueryMutation,
    isPending,
    isError,
    isSuccess,
  } = useQueryDataMutation();

  const { withErrorDialog } = useErrorDialog();

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (!dbSelected) {
      withErrorDialog(
        () =>
          Promise.reject(
            new Error('No database selected, select a database first'),
          ),
        'Database Error',
        'commonError',
      );
      return;
    }
    if (e.key === 'Enter' && value.trim() !== '') {
      const queryToAdd = trimString(value);
      // Mutate synchronously, handle success/error with callbacks
      runQueryMutation(
        { query: queryToAdd, database: dbSelected },
        {
          onSuccess: (data, variables) => {
            const newId = addQuery({
              query: variables.query,
              modified: data.query,
              database: dbSelected,
            });
            setQuerySelection(newId);
            queryClient.setQueryData(
              queryKeys.query(variables.database, newId),
              data,
            );
            if (location.pathname !== routes.front.queryView) {
              navigate(routes.front.queryView);
            }
          },
          onError: () => {
            // optional (you already handle globally)
          },
        },
      );
    }
  };

  return (
    <>
      <div className='w-full flex items-center gap-2'>
        <input
          className='input'
          placeholder='enter database query'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!dbSelected || isPending}
        />
      </div>
      {isPending && <ScreenLoader />}
    </>
  );
};
