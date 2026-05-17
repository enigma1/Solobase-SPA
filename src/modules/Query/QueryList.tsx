import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useQueryDataHook } from '>/services/queryHooks';
import {
  useDialogStore,
  useHistoryStore,
  useAccountStore,
} from '>/services/stores';
import { DialogRenderer } from '>/modules/Common';
import { errorDialogMap } from '>/modules/Common/DialogRenderer';

export const QueryList = () => {
  const queryClient = useQueryClient();

  const { setQuerySelection, getQuery, queryIds, queriesObj } = useHistoryStore(
    ({ state, api }) => ({
      setQuerySelection: api.setQuerySelection,
      getQuery: api.getQuery,
      queryIds: state.queryIds,
      queriesObj: state.queriesObj,
    }),
  );
  const querySelection = getQuery();

  // const { data, isLoading, isSuccess, isError } = useQueryDataHook(
  //   ({ state, query }) => ({
  //     isLoading: query.isLoading,
  //     isSuccess: query.isSuccess,
  //     isError: query.isError,
  //     data: state,
  //   }),
  // );

  // if (isLoading) return <Spinner />;
  // if (isError) return <ErrorView />;

  // const { query, truncated, cols, rows, columnsOrder } = data ?? {
  //   rows: [],
  //   cols: {},
  //   query: '',
  //   truncated: false,
  //   columnsOrder: [],
  // };

  const { dbSelected } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
  }));

  // const { dialog, openDialog, closeDialog } = useDialogStore(
  //   ({ state, api }) => ({
  //     openDialog: api.openDialog,
  //     closeDialog: api.closeDialog,
  //     dialog: state.dialog,
  //   }),
  // );

  // useEffect(() => {
  //   if (!dbSelected || !querySelection) return;

  //   const { original, modified, database } = querySelection ?? null;

  //   queryClient.invalidateQueries({
  //     queryKey: queryKeys.query(querySelection?.database, original, modified),
  //     exact: true,
  //   });
  // }, [dbSelected, querySelection]);

  const handleQueryChange = async (id: string) => {
    setQuerySelection(id);
  };

  return (
    <>
      <div className='side-list'>
        {queryIds.length > 0 ? (
          queryIds.map((qid, idx) => {
            const query = queriesObj[qid];
            const isSelected = querySelection?.id === qid;
            return (
              <button
                key={`${qid}-${idx}`}
                className='side-list-item'
                data-active={isSelected}
                title={`${query.database}: ${query.original}`}
                onClick={() => handleQueryChange(qid)}
              >
                {query.original}
              </button>
            );
          })
        ) : (
          <div className='side-list-empty'>No Queries Set</div>
        )}
      </div>
      {/* <DialogRenderer
        dialog={dialog}
        onClose={closeDialog}
        map={errorDialogMap}
      /> */}
    </>
  );
};
