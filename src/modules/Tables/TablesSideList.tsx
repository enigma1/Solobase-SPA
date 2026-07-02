import { useNavigate, useLocation } from 'react-router-dom';
import { useTablesHook } from '>/services/queryHooks';
import { isObjectEmpty, dialogActions } from '>/services/utils';
import {
  useAccountStore,
  useTablesDataStore,
  dialogStoreActions,
} from '>/services/stores';
import { ScreenLoader, DialogContent } from '>/modules';
import { routes } from '>/config';

export const TablesSideList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTable, setActiveTable, dbSelected } = useAccountStore(
    ({ state, api }) => ({
      dbSelected: state.dbSelected,
      activeTable: state.activeTable,
      setActiveTable: api.setActiveTable,
    }),
  );

  const { editedRow, markEditedRow } = useTablesDataStore(({ state, api }) => ({
    editedRow: state.editedRow,
    markEditedRow: api.markEditedRow,
  }));

  const { tables, tablesCount, isFetching, isSuccess, isLoading } =
    useTablesHook(({ api, query }) => ({
      tables: api.getTablesNames(),
      tablesCount: api.getTablesCount(),
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isLoading: query.isLoading,
    }));

  const handleSwitchTable = (name: string) => {
    if (name === activeTable) {
      if (location.pathname !== routes.front.listData) {
        navigate(routes.front.listData);
      }
      return;
    }
    if (!isObjectEmpty(editedRow)) {
      dialogStoreActions.openDialog({
        payload: {
          caption: 'Unsaved Changes',
          component: (
            <DialogContent note='Data Row Edits'>
              {
                'You have unsaved changes. Switching tables will discard them. Continue?'
              }
            </DialogContent>
          ),
          actions: dialogActions.confirmCancel({
            onConfirm: () => {
              dialogStoreActions.closeDialog();
              markEditedRow({});
              setActiveTable(name);
              if (location.pathname !== routes.front.listData) {
                navigate(routes.front.listData);
              }
            },
          }),
        },
      });
      return;
    }
    setActiveTable(name);
    if (location.pathname !== routes.front.listData) {
      navigate(routes.front.listData);
    }
  };

  const isBusy = isLoading;
  return (
    <>
      {isBusy && <ScreenLoader />}
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
    </>
  );
};
