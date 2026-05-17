import { useState, useEffect, useRef } from 'react';
import { queryClient } from '>/config/reactQuery';
import {
  useAccountStore,
  useTablesStore,
  useMessageStore,
  useDialogStore,
} from '>/services/stores';
import {
  Scalar,
  ScalarObject,
  SqlColumnsShape,
  SqlRow,
} from '>/types/dbTables';
import {
  DialogRenderer,
  EffectiveTableWrapper,
  ScreenLoader,
  Checkbox,
} from '>/modules/Common';
import { SqlShell } from './SqlShell';
import { tableDialogMap } from './DialogMap';
import {
  MutationCallbacks,
  queryKeys,
  useUpdateRowsMutation,
} from '>/services/queryHooks';
import { getMergedColumnData, updateRowsSqlTransformer } from './helpers';
import { isObjectEmpty } from '>/services/utils';
import { useColumnResize, useEffectiveTableWidth } from '>/services/hooks';
import { ViewRow } from '>/types/common';
import {
  UpdateRowsRequest,
  UpdateRowsResponse,
} from '>/services/api/dbApiTypes';
import { Message, MessageContent } from '>/types/status';

type TableViewProps = {
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
};

export const SqlView = ({ cols, rows, columnsOrder }: TableViewProps) => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const addMessage = useMessageStore(({ api }) => api.addMessage);

  const { dbSelected } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
  }));

  const { activeTable, editedRow, markEditedRow } = useTablesStore(
    ({ state, api }) => ({
      activeTable: state.activeTable as string,
      editedRow: state.editedRow as Record<number, ScalarObject>,
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

  const outerRef = useRef<HTMLDivElement>(null);
  const { colWidths, startResize } = useColumnResize(
    columnsOrder,
    outerRef,
    resizeLineRef,
  );

  // const effectiveWidth = useEffectiveTableWidth({
  //   outerRef,
  //   colWidths,
  //   columnsOrder,
  // });

  const callbacks = {
    onSuccess: () => {
      // Remove rows from query cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.rows(dbSelected, activeTable),
      });
      // reset local edited state if provided
      console.log('editedRow before reset', editedRow);
      markEditedRow({});
      addMessage({
        id: crypto.randomUUID(),
        type: 'success',
        mode: 'header',
        content: { text: `Rows saved successfully`, duration: 3000 },
      } satisfies Message<MessageContent>);
    },

    onError: (error) => {
      console.error('Update SQL rows failed', error);
      addMessage({
        id: crypto.randomUUID(),
        type: 'error',
        mode: 'header',
        content: { text: `Failed to save SQL changes`, duration: 5000 },
      } satisfies Message<MessageContent>);
    },
  } as MutationCallbacks<UpdateRowsResponse, UpdateRowsRequest>;

  const { mutate, isPending, isError, isSuccess } = useUpdateRowsMutation(
    ({ api, query }) => ({
      isPending: query.isPending,
      isError: query.isError,
      isSuccess: query.isSuccess,
      mutate: api.mutate,
    }),
    callbacks,
  );

  const handleDoubleClick = ({
    row,
    rId,
    cId,
    colName,
  }: {
    row: Scalar[];
    rId: number;
    cId: number;
    colName: string;
  }) => {
    openDialog({
      type: 'editCell',
      payload: {
        row,
        cId,
        rId,
        colName,
        onSave: (newValue: Scalar) => {
          closeDialog();
          markEditedRow((previousState) => {
            const prevRow =
              (previousState as Record<number, ScalarObject>)[rId] || {};
            const updatedRow = { ...prevRow };
            updatedRow[cId] = newValue;
            return {
              ...previousState,
              [rId]: updatedRow,
            };
          });
        },
      },
    });
  };

  const discardRow = (rowId: number) => {
    const { [rowId]: _, ...prevState } = editedRow;
    markEditedRow(prevState);
  };

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

  const handleDownloadTable = () => {};

  const handleSaveRows = () => {
    const rowsTransformed = updateRowsSqlTransformer({
      componentShape: editedRow,
      cols,
      table: activeTable,
      originalRows: rows.map((r) => r.row) as SqlRow[],
    });
    mutate(rowsTransformed);
  };

  // useEffect(() => {
  //   console.log('TableView MOUNT');

  //   return () => {
  //     console.log('TableView UNMOUNT');
  //   };
  // }, []);

  // const totalTableWidth = columnsOrder.reduce(
  //   (sum, colName) => sum + (colWidths[colName] ?? 150),
  //   0,
  // );

  return (
    <>
      <SqlShell
        tableName={activeTable}
        tableRef={tableRef}
        rowCount={rows.length}
        hasEdits={!isObjectEmpty(editedRow)}
        onDiscard={discardEditedRows}
        onSave={handleSaveRows}
        onDownload={handleDownloadTable}
      />
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <table className='table' ref={tableRef}>
          <thead>
            <tr>
              <th />
              {columnsOrder.map((colName, idx) => {
                const colData = cols[colName];
                const title = `type: ${colData?.type} / nullable: ${colData?.nullable} / key: ${colData?.key} / default: ${colData?.defaultValue} / extra: ${colData?.extra}`;
                return (
                  <th
                    key={`col-${colName}-${idx}`}
                    title={title}
                    style={{ width: `${colWidths[colName]}px` }}
                  >
                    <div className='col-header'>
                      <span className='truncate'>{colName}</span>
                    </div>
                    <div
                      onMouseDown={(e) => startResize(e, colName)}
                      className='col-handle'
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((oRow, idx) => {
              const uid = oRow.uiKey;
              const row = getMergedColumnData(oRow.row, editedRow[uid]);
              const rowBg = editedRow[uid]
                ? 'bg-yellow-50 border-l-4 border-yellow-300'
                : idx % 2 === 0
                  ? 'even'
                  : 'odd';
              return (
                <tr key={`row-${uid}`} className={`${rowBg}`}>
                  <td>
                    <Checkbox
                      checked={selectedRows.has(uid)}
                      onChange={(checked) => {
                        setSelectedRows((prev) => {
                          const next = new Set(prev);
                          if (checked) {
                            next.add(uid);
                          } else {
                            next.delete(uid);
                          }
                          return next;
                        });
                      }}
                    />
                  </td>
                  {columnsOrder.map((colName, colIndex) => {
                    const getValue = () => {
                      const value = row[colIndex];
                      if (value === null) return 'NULL';
                      if (typeof value === 'object') {
                        return (
                          <pre className='whitespace-pre-wrap'>
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        );
                      }
                      if (typeof value === 'bigint') {
                        return value.toString();
                      }
                      return String(value);
                    };
                    return (
                      <td
                        key={colIndex}
                        className={`${editedRow?.[uid]?.[colIndex] ? 'selected' : ''}`}
                        onDoubleClick={() =>
                          handleDoubleClick({
                            row: [...row],
                            rId: uid,
                            cId: colIndex,
                            colName,
                          })
                        }
                      >
                        {getValue()}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </EffectiveTableWrapper>
      {isPending && <ScreenLoader />}
      <DialogRenderer
        dialog={dialog}
        onClose={closeDialog}
        map={tableDialogMap}
      />
    </>
  );
};
