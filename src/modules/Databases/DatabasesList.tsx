import { useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { aStub, isObjectEmpty, getMergedColumnData } from '>/services/utils';
import {
  queryKeys,
  useDeleteDatabasesMutation,
  useDatabaseServerInfo,
} from '>/services/queryHooks';
import {
  messageStoreActions,
  useDialogStore,
  useDatabasesStore,
  createUiTableStore,
} from '>/services/stores';
import { DeleteDatabasesRequest } from '>/services/api';
import { SqlColumnsShape, SqlRow, ScalarObject } from '>/types';
import {
  DialogRenderer,
  ScreenLoader,
  EffectiveTableWrapper,
  TableContainer,
  PageTableShell,
} from '>/modules';
// import { queryClient } from '>/config/reactQuery';
import { useEffect } from 'react';
import { DatabaseShell } from './DatabaseShell';
import { dbDialogMap } from './DialogMap';

type ViewRow<T> = {
  row: T;
  uiKey: number;
};

type DatabasesListProps = {
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
};

export const DatabasesList = ({
  cols,
  rows,
  columnsOrder,
}: DatabasesListProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const tableStore = useMemo(() => createUiTableStore(), []);
  const queryClient = useQueryClient();
  const { editedRow, markEditedRow } = useDatabasesStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<number, ScalarObject>,
    markEditedRow: api.markEditedRow,
  }));

  const { collationsByCharset, defaults, isLoading, isSuccess } =
    useDatabaseServerInfo(({ state, query }) => ({
      collationsByCharset: state.collationsByCharset,
      defaults: state.defaults,
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
    }));

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

  const callbacks = {
    onSuccess: (data: any) => {
      if (data?.success) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.databases(),
          exact: true,
        });
      }
      messageStoreActions.addMessage({
        type: 'success',
        content: { text: 'Selected Databases removed', duration: 3000 },
      });
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to remove databases', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useDeleteDatabasesMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    callbacks,
  );

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.databaseServerInfo(),
      exact: true,
    });
  }, []);

  const discardEditedRows = () => {
    openDialog({
      type: 'discardChanges',
      payload: {
        caption: 'Discard Changes',
        message: 'Are you sure you want to discard all changes?',
        onConfirm: () => {
          closeDialog();
          markEditedRow({});
        },
        onCancel: () => closeDialog(),
      },
    });
  };

  const handleSelectedExports = () => {};
  const handleSaveRows = () => {};
  const handleDownloadDatabases = () => {};
  const handleDeleteDatabases = () => {};
  const handleColumnsActive = () => {};

  const shellHandlers = {
    onExport: handleSelectedExports,
    onDiscard: discardEditedRows,
    onDelete: handleDeleteDatabases,
    onDownload: handleDownloadDatabases,
    onSave: handleSaveRows,
    onFilterColumns: handleColumnsActive,
  };

  // const validCollations = collationsByCharset[charset]?.collations ?? [];
  const onDbSubmit = async (data: DeleteDatabasesRequest) => {
    mutate(data);
  };

  const onDoubleClick = () => {};

  const dbCharsets = Object.keys(collationsByCharset);

  return (
    <>
      <PageTableShell
        store={tableStore}
        title={`Databases: ${rows.length > 0 ? rows.length : 'None'}`}
        tableRef={tableRef}
        actions={shellHandlers}
      />
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <TableContainer
          cols={cols}
          rows={rows}
          columnsOrder={columnsOrder}
          store={tableStore}
          outerRef={outerRef}
          tableRef={tableRef}
          onEditCell={onDoubleClick}
          editedRow={editedRow}
        />
      </EffectiveTableWrapper>
      {isPending && <ScreenLoader />}
      <DialogRenderer dialog={dialog} onClose={closeDialog} map={dbDialogMap} />
    </>
  );
};
