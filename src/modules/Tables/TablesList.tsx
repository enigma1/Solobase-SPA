import { useTablesHook } from '>/services/queryHooks';
import { isObjectEmpty } from '>/services/utils';
import { useDialogStore, useTablesStore } from '>/services/stores';
import { DialogRenderer, ScreenLoader } from '>/modules/Common';
import { tableDialogMap } from './DialogMap';

export const TablesList = () => {
  const { editedRow, activeTable, setActiveTable, markEditedRow } =
    useTablesStore(({ state, api }) => ({
      // tables: state.tables,
      activeTable: state.activeTable,
      editedRow: state.editedRow,
      setActiveTable: api.setActiveTable,
      markEditedRow: api.markEditedRow,
    }));

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

  const { tables, getTablesCount, isLoading, isSuccess } = useTablesHook(
    ({ state, api, query }) => ({
      tables: state.tables,
      getTablesCount: api.getTablesCount,
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
    }),
  );
  // const tablesCountText = data?.tables.length ? `: ${data.tables.length}` : '';

  const handleFetchRows = (name: string) => {
    console.log('handle-fetch-rows', activeTable);
    if (name === activeTable) return; // no-op
    if (!isObjectEmpty(editedRow)) {
      openDialog({
        type: 'unsavedChanges',
        payload: {
          caption: 'Unsaved Changes',
          message:
            'You have unsaved changes. Switching tables will discard them. Continue?',
          onConfirm: () => {
            closeDialog();
            markEditedRow({});
            setActiveTable(name);
          },
          onCancel: () => closeDialog(),
        },
      });

      return;
    }
    setActiveTable(name);
  };

  return (
    <>
      <div className='side-list'>
        {isSuccess ? (
          getTablesCount() > 0 ? (
            Object.keys(tables).map((name) => {
              return (
                <button
                  key={name}
                  className='side-list-item'
                  data-active={activeTable === name}
                  onClick={() => handleFetchRows(name)}
                >
                  {name}
                </button>
              );
            })
          ) : (
            <div className='side-list-empty'>No Tables</div>
          )
        ) : null}
      </div>

      <DialogRenderer
        dialog={dialog}
        onClose={closeDialog}
        map={tableDialogMap}
      />

      {isLoading && <ScreenLoader />}
    </>
  );
};
