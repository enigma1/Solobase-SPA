import { useMemo } from 'react';
import { JSONObject } from 'type-plus';
import ReactJsonView, { InteractionProps } from '@microlink/react-json-view';
import { queryClient } from '>/config/reactQuery';
import { dialogActions } from '>/services/utils';
import {
  useDialogStore,
  useTablesDataStore,
  useMessageStore,
  createFactoryTableStore,
} from '>/services/stores';
import {
  queryKeys,
  useUpdateRowsMutation,
  MutationCallbacks,
} from '>/services/queryHooks';
import { UpdateRowsRequest, UpdateRowsResponse } from '>/services/api';
import { DialogContent, ScreenLoader, PageTableShell } from '>/modules';
import { PrimeObject, CollectionRow } from '>/types';
import { updateRowsCollectionTransformer } from './helpers';

type KnownProps = {
  _id: string;
};
type CollectionItem = KnownProps & PrimeObject<JSONObject>;
export type CollectionViewType = CollectionItem[];

type CollectionViewProps = {
  rows: CollectionViewType;
  dbSelected: string;
  activeTable: string;
};

export const CollectionView = (props: CollectionViewProps) => {
  const restrictedFields = ['_id'];
  const { rows, activeTable, dbSelected } = props;
  const tableStore = useMemo(() => createFactoryTableStore(), []);

  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
    editedRow: state.editedRow as Record<string, CollectionRow>,
    markEditedRow: api.markEditedRow,
  }));

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

  const addMessage = useMessageStore(({ api }) => api.addMessage);

  const callbacks: MutationCallbacks<UpdateRowsResponse, UpdateRowsRequest> = {
    onSuccess: () => {
      // Remove rows from query cache
      queryClient.removeQueries({
        queryKey: queryKeys.rows(dbSelected, activeTable),
      });
      // reset local edited state if provided
      markEditedRow({});
      addMessage({
        type: 'success',
        content: { text: `Rows saved successfully`, duration: 3000 },
      });
    },

    onError: (error) => {
      addMessage({
        content: { text: `Failed to save changes`, duration: 3000 },
      });
    },
  };

  // const { mutate, isPending, isError } = useUpdateRowsMutation({
  //   resetEditedRows: () => markEditedRow({}),
  // });
  const { mutate, isLoading } = useUpdateRowsMutation(
    ({ api, state, query }) => ({
      isLoading: query.isPending,
      mutate: api.mutate,
    }),
    callbacks,
  );

  const handleRow = (row: CollectionItem) => {};
  const handleEdit = (editProps: InteractionProps, id: string) => {
    const { name } = editProps;
    if (name === null || restrictedFields.includes(name)) return false;
    markEditedRow((previousState) => {
      return {
        ...(previousState && previousState),
        [id]: editProps.updated_src,
      };
    });
    return true;
  };

  const saveRow = (rowKey: string) => {
    console.log('saving');
    // const rsp = await withErrorDialog(
    //   () => dbApi.saveRow(),
    //   'Saving Row failed',
    //   'errorSavingRow',
    // );

    const wasSaved = true;
    if (wasSaved) {
    }
  };

  const saveAll = () => {
    const params = {
      componentShape: editedRow,
      table: activeTable,
      originalRows: rows,
    };
    const rowsTransformed = updateRowsCollectionTransformer(params);
    mutate(rowsTransformed);
  };

  const discardRow = (rowKey: string) => {
    const stringRow = editedRow;
    const { [rowKey]: _, ...prevState } = stringRow;
    markEditedRow(prevState);
  };

  const discardChanges = () => {
    openDialog({
      payload: {
        caption: 'Collection Edits',
        component: (
          <DialogContent note='Discard Changes'>
            {'About to discard all changes made. Are you sure?'}
          </DialogContent>
        ),

        actions: dialogActions.confirmCancel({
          onConfirm: () => {
            closeDialog();
            markEditedRow({});
          },
        }),
      },
    });
  };

  const handleSelectedExports = () => {};
  const handleSaveRows = () => {};
  const handleDownloadDatabases = () => {};
  const handleDeleteRows = () => {};

  const shellHandlers = {
    onExport: handleSelectedExports,
    onDiscard: discardChanges,
    onDelete: handleDeleteRows,
    onDownload: handleDownloadDatabases,
    onSave: handleSaveRows,
  };

  return (
    <>
      <PageTableShell
        title={`Collection: ${activeTable}`}
        store={tableStore}
        actions={shellHandlers}
      />
      {rows.map((row, idx) => {
        const rowKey = `${idx}-${row._id}`;
        return (
          <div key={rowKey} className='border rounded-md p-3 mb-3 shadow-sm'>
            <div
              role='button'
              tabIndex={0}
              onClick={() => handleRow(row)}
              className='cursor-pointer'
            >
              <div className='overflow-auto'>
                <ReactJsonView
                  src={editedRow?.[rowKey] ?? row}
                  name={row._id}
                  collapsed={true}
                  onEdit={(props) => handleEdit(props, row._id)}
                />
              </div>

              {editedRow?.[rowKey] && (
                <div className='flex gap-2 mt-2'>
                  <button
                    className='px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700'
                    onClick={() => saveRow(rowKey)}
                  >
                    Save
                  </button>
                  <button
                    className='px-2 py-1 bg-gray-200 rounded hover:bg-gray-300'
                    onClick={() => discardRow(rowKey)}
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {isLoading && <ScreenLoader />}
    </>
  );
};
