import { useEffect, useRef, useMemo } from 'react';
import { CaptionsIcon, SquareArrowRightEnterIcon } from 'lucide-react';

import { dbApi } from '>/services/api';
import { useRawQueryMutation } from '>/services/queryHooks';
import {
  createFactoryTableStore,
  dialogStoreActions,
  useQueriesStore,
  messageStoreActions,
} from '>/services/stores';
import {
  ScreenLoader,
  EffectiveTableWrapper,
  SqlTableContainer,
  PageTableShell,
  FilterColumns,
  EmptyListing,
  TitleArea,
  dialogFactories,
} from '>/modules';
import type { ViewRow, SqlRow } from '>/types';

export const QueryView = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  const tableStore = useMemo(() => createFactoryTableStore(), []);
  const { getSelectedQuery, getQueries } = useQueriesStore(
    ({ state, api }) => ({
      getSelectedQuery: api.getSelectedQuery,
      getQueries: api.getQueries,
    }),
  );

  const currentQuery = getSelectedQuery();

  const queryCallbacks = {
    onSuccess: (data: any) => {
      if (!data.ok) {
        messageStoreActions.addMessage({
          type: 'warn',
          content: { text: 'Query executed with issues', duration: 3000 },
        });
      }

      // if (data.ok) {
      //   messageStoreActions.addMessage({
      //     type: 'success',
      //     content: { text: 'Query executed successfully', duration: 3000 },
      //   });
      // } else {
      //   messageStoreActions.addMessage({
      //     type: 'warn',
      //     content: {
      //       text: data.message ?? 'Not all databases were removed',
      //       duration: 3000,
      //     },
      //   });
      // }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to execute query', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useRawQueryMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    queryCallbacks,
  );

  useEffect(() => {
    if (!currentQuery) return;

    mutate({
      query: currentQuery.query,
      database: currentQuery.database,
      groupByMode: currentQuery.groupByMode,
    });
  }, [currentQuery?.query, currentQuery?.database]);

  const isResultSet = response.mode === 'resultset';
  const rows = isResultSet ? response.rows : [];
  const cols = isResultSet ? response.cols : {};
  const columnsOrder = isResultSet ? response.columnsOrder : [];

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: idx.toString(),
    }));
  }, [rows]);

  const handleCreateQuery = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.makeQuery(),
    });
  };

  const onEditSql = () => {
    currentQuery &&
      dialogStoreActions.openDialog({
        payload: dialogFactories.editQuery(currentQuery.title),
      });
  };

  const shellHandlers = {};

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;

  if (!currentQuery || viewRows.length === 0) {
    return (
      <EmptyListing
        onCreate={handleCreateQuery}
        note={`${viewRows.length === 0 ? 'No queries currently available' : 'No Query selected'}`}
      />
    );
  }

  if (!isResultSet) {
    // return <CommandResult resultInfo={response.resultInfo} />;
    return null;
  }

  const db = currentQuery.database ? `in ${currentQuery.database}` : '';
  const title = `${currentQuery.title.length > 0 ? 'Query: ' + currentQuery.title : 'Dynamic Query Results'}`;

  return (
    <>
      <PageTableShell
        store={tableStore}
        title={`${title} ${db}`}
        tableRef={tableRef}
        actions={shellHandlers}
      />
      <div className='page-section liner'>
        <button className='btn' onClick={onEditSql} title='Edit Query'>
          <SquareArrowRightEnterIcon onClick={onEditSql} size={16} />
        </button>
        <span className='stand'>{currentQuery.query}</span>
      </div>
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <SqlTableContainer
          cols={cols}
          rows={viewRows}
          columnsOrder={columnsOrder}
          activeCols={columnsOrder}
          store={tableStore}
          outerRef={outerRef}
          tableRef={tableRef}
          resizeLineRef={resizeLineRef}
        />
      </EffectiveTableWrapper>
    </>
  );
};
