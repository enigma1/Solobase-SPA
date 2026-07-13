import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SquareArrowRightEnterIcon } from 'lucide-react';
import { useRawQueryMutation, useImportDataWrap } from '>/services/queryHooks';
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
  dialogFactories,
} from '>/modules';
import { routes } from '>/config';
import type { ViewRow, SqlRow } from '>/types';
import { QueryCommandView } from './QueryCommandView';

export const QueryView = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(() => createFactoryTableStore({}), []);
  const navigate = useNavigate();

  const { getSelectedQuery, selectedQueryTitle } = useQueriesStore(
    ({ api, state }) => ({
      getSelectedQuery: api.getSelectedQuery,
      selectedQueryTitle: state.selectedQueryTitle,
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
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to execute query', duration: 3000 },
      });
    },
  };

  const {
    mutate: mutateImport,
    isPending: isPendingImport,
    response: responseImport,
  } = useImportDataWrap();

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

    if (currentQuery.multi) {
      mutateImport({
        data: currentQuery.query,
        database: currentQuery.database,
        groupByMode: currentQuery.groupByMode,
      });
      navigate(routes.front.importView);
      return;
    }
    mutate({
      query: currentQuery.query,
      database: currentQuery.database,
      groupByMode: currentQuery.groupByMode,
    });
  }, [currentQuery]);

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

  const isBusy = isPending || isPendingImport;
  if (isBusy) return <ScreenLoader />;

  if (!currentQuery || viewRows.length === 0) {
    if (response.mode === 'command') {
      return (
        <QueryCommandView
          message={response.message}
          resultInfo={response.resultInfo}
        />
      );
    }
    return (
      <EmptyListing
        onCreate={handleCreateQuery}
        note={`${viewRows.length === 0 ? 'No queries currently available' : 'No Query selected'}`}
      />
    );
  }

  const db = currentQuery.database ? `in ${currentQuery.database}` : '';
  const title = `${selectedQueryTitle && selectedQueryTitle.length > 0 ? 'Query: ' + selectedQueryTitle : 'Dynamic Query Results'}`;

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
