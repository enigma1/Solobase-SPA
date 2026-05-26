import { useNavigate, useLocation } from 'react-router-dom';
import { useTablesHook } from '>/services/queryHooks';
import { isObjectEmpty } from '>/services/utils';
import {
  useAccountStore,
  useDialogStore,
  useTablesDataStore,
} from '>/services/stores';
import { DialogRenderer, ScreenLoader } from '>/modules';
import { routes } from '>/config';
import { tableDialogMap } from './DialogMap';

export const TablesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { activeTable, setActiveTable } = useAccountStore(({ state, api }) => ({
    activeTable: state.activeTable,
    setActiveTable: api.setActiveTable,
  }));

  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
    editedRow: state.editedRow,
    markEditedRow: api.markEditedRow,
  }));

  const { dialog, openDialog, closeDialog } = useDialogStore(
    ({ api, state }) => ({
      dialog: state.dialog,
      openDialog: api.openDialog,
      closeDialog: api.closeDialog,
    }),
  );

  const { tables, tablesCount, isLoading, isSuccess } = useTablesHook(
    ({ api, query }) => ({
      tables: api.getTablesNames(),
      tablesCount: api.getTablesCount(),
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
    }),
  );

  const handleSwitchTable = (name: string) => {
    if (name === activeTable) return;
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
            if (location.pathname !== routes.front.tableView) {
              navigate(routes.front.tableView);
            }
          },
          onCancel: () => closeDialog(),
        },
      });

      return;
    }
    setActiveTable(name);
    if (location.pathname !== routes.front.tableView) {
      navigate(routes.front.tableView);
    }
  };

  return (
    <>
      <div className='side-list'>
        {isSuccess ? (
          tablesCount > 0 ? (
            tables.map((name: string) => {
              return (
                <button
                  key={name}
                  className='side-list-item'
                  data-active={activeTable === name}
                  onClick={() => handleSwitchTable(name)}
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
