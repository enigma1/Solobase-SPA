import { useEffect, useRef, useMemo } from 'react';
import { useTableColumnsInfoHook, useUsers } from '>/services/queryHooks';
import {
  useAccountStore,
  useColumnsStore,
  createFactoryTableStore,
  dialogStoreActions,
} from '>/services/stores';
import { getColumnsFromRow, userBasics, userFields } from '>/services/utils';
import {
  ScreenLoader,
  dialogFactories,
  EmptyListing,
  FiltersAndSortsNotice,
} from '>/modules';
import { ViewRow, SqlRow } from '>/types';
import { UsersList } from './UsersList';

export const UsersView = () => {
  const tableStore = useMemo(
    () => createFactoryTableStore({ listingType: 'userRows' }),
    [],
  );

  const username = useAccountStore(({ state }) => state.username);

  const { cols: colsInfo, isSuccess: isSuccessInfo } = useTableColumnsInfoHook(
    userBasics,
    ({ state, query }) => ({
      cols: state.cols,
      isSuccess: query.isSuccess,
    }),
  );

  const { pastColumnsActions, getSortBy, getFilters } = useColumnsStore(
    ({ state, api }) => ({
      pastColumnsActions: state.pastColumnsActions,
      getSortBy: api.getSortBy,
      getFilters: api.getFilters,
    }),
  );

  const { cPaging, clearSelected } = tableStore.useFactoryTableStore(
    ({ state, api }) => ({
      cPaging: state.paging,
      clearSelected: api.clearSelected,
    }),
  );

  const { cSortBy, cFilters, request } = useMemo(() => {
    const cSortBy = getSortBy(colsInfo);
    const cFilters = getFilters(colsInfo);

    const request = {
      paging: {
        limit: cPaging.limit,
        offset: cPaging.offset,
      },
      ...(Object.keys(cSortBy).length && { sortBy: cSortBy }),
      ...(Object.keys(cFilters).length && { filters: cFilters }),
    };

    return {
      cSortBy,
      cFilters,
      request,
    };
  }, [cPaging.limit, cPaging.offset, colsInfo, pastColumnsActions]);

  const { rows, cols, columnsOrder, responsePaging, isSuccess, isFetching } =
    useUsers(
      request,
      ({ state, query }) => ({
        isSuccess: query.isSuccess,
        isFetching: query.isFetching,
        rows: state.rows,
        cols: state.cols,
        columnsOrder: state.columnsOrder,
        responsePaging: state.paging,
      }),
      {
        enabled: isSuccessInfo,
      },
    );

  const viewRows: ViewRow<SqlRow>[] = useMemo(() => {
    return rows.map((row, idx) => ({
      row,
      uiKey: (cPaging.offset + idx).toString(),
    }));
  }, [rows]);

  const uidSelected = useMemo(() => {
    for (const row of viewRows) {
      const colNames = getColumnsFromRow({
        row: row.row,
        columnsOrder,
        fields: [userFields.name],
      });

      if (colNames[userFields.name] === username) {
        return row.uiKey;
      }
    }

    return undefined;
  }, [username, viewRows, columnsOrder]);

  useEffect(() => {
    if (!isSuccess) return;

    tableStore.api.setPaging({
      hasNext: responsePaging?.hasNext ?? false,
      hasPrevious: responsePaging?.hasPrevious ?? false,
    });
  }, [isSuccess, responsePaging?.hasNext, responsePaging?.hasPrevious]);

  const isBusy = !isSuccessInfo || (!isSuccess && isFetching);
  if (isBusy) return <ScreenLoader />;

  const onCreate = () => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.createUser(),
    });
  };

  if (rows.length === 0) {
    const hasSorts = Object.keys(cSortBy).length > 0;
    const hasFilters = Object.keys(cFilters).length > 0;

    let notice;
    if (hasFilters || hasSorts) {
      notice = (
        <FiltersAndSortsNotice
          cols={cols}
          clearSorts={hasSorts}
          clearFilters={hasFilters}
        />
      );
    } else {
      notice = (
        <div className='wrapper'>
          <button type='button' className='btn' onClick={onCreate}>
            Create New User
          </button>
        </div>
      );
    }
    return (
      <EmptyListing onCreate={onCreate} note='There are no users to list'>
        {notice}
      </EmptyListing>
    );
  }

  return (
    <UsersList
      username={username}
      rows={viewRows}
      cols={cols}
      columnsOrder={columnsOrder}
      store={tableStore}
      uidSelected={uidSelected}
    />
  );
};
