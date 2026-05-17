import { JSONObject } from 'type-plus';
import ReactJsonView, { InteractionProps } from '@microlink/react-json-view';
import { isObjectEmpty } from '>/services/utils';
import { PrimeObject, CollectionRow } from '>/types';
import {
  useDialogStore,
  useTablesStore,
  useMessageStore,
} from '>/services/stores';
import {
  queryKeys,
  useUpdateRowsMutation,
  MutationCallbacks,
} from '>/services/queryHooks';

import { Message, MessageContent } from '>/types';
import { useAccountStore } from '>/services/stores';
import { UpdateRowsRequest, UpdateRowsResponse } from '>/services/api';
import { DialogRenderer, ScreenLoader } from '>/modules/Common';
import { tableDialogMap } from './DialogMap';
import { updateRowsCollectionTransformer } from './helpers';
// Replaced styled-components with Tailwind classes in JSX
import { queryClient } from '</src/config/reactQuery';

type KnownProps = {
  _id: string;
};
type CollectionItem = KnownProps & PrimeObject<JSONObject>;
export type CollectionViewType = CollectionItem[];

type CollectionViewProps = {
  rows: CollectionViewType;
};

export const CollectionView = (props: CollectionViewProps) => {
  // const [editedRow, markEditedRow] = useState<PrimeObject<JSONObject>>({});
  const restrictedFields = ['_id'];
  const { rows } = props;

  const { dbSelected } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
  }));

  const { activeTable, editedRow, markEditedRow } = useTablesStore(
    ({ state, api }) => ({
      activeTable: state.activeTable as string,
      editedRow: state.editedRow as Record<string, CollectionRow>,
      markEditedRow: api.markEditedRow,
    }),
  );

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

  const addMessage = useMessageStore(({ api }) => api.addMessage);

  const callbacks = {
    onSuccess: () => {
      // Remove rows from query cache
      queryClient.removeQueries({
        queryKey: queryKeys.rows(dbSelected, activeTable),
      });
      // reset local edited state if provided
      markEditedRow({});
      addMessage({
        id: crypto.randomUUID(),
        type: 'success',
        mode: 'header',
        content: { text: `Rows saved successfully`, duration: 3000 },
      } satisfies Message<MessageContent>);
    },

    onError: (error) => {
      console.error('Update rows failed', error);
      addMessage({
        id: crypto.randomUUID(),
        type: 'error',
        mode: 'header',
        content: { text: `Failed to save changes`, duration: 3000 },
      } satisfies Message<MessageContent>);
    },
  } as MutationCallbacks<UpdateRowsResponse, UpdateRowsRequest>;

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

  return (
    <>
      {!isObjectEmpty(editedRow) && (
        <div className='flex gap-2 mb-4'>
          <button
            className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
            onClick={discardChanges}
          >
            Discard All
          </button>
          <button
            className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
            onClick={saveAll}
          >
            Save All
          </button>
        </div>
      )}
      {rows.map((row, idx) => {
        const rowKey = `${idx}-${row._id}`;
        return (
          <div
            key={rowKey}
            className='border rounded-md p-3 mb-3 bg-white shadow-sm'
          >
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
      <DialogRenderer
        dialog={dialog}
        onClose={closeDialog}
        map={tableDialogMap}
      />
    </>
  );
};
