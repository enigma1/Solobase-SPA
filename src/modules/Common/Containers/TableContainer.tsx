import { useState, useRef, type RefObject } from 'react';
import { SqlColumnsShape, SqlRow } from '>/types/dbTables';
import { useColumnResize } from '>/services/hooks';
import { Checkbox } from '>/modules';
import { getMergedColumnData } from '>/services/utils';
import { ViewRow, ScalarObject, Scalar } from '>/types';
import type { UiTableStore } from '>/services/stores';

type EditHandlerProps = {
  row: Scalar[];
  rId: number;
  cId: number;
  colName: string;
};

type TableContainerProps = {
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  store: UiTableStore;
  outerRef: RefObject<HTMLDivElement | null>;
  tableRef?: React.RefObject<HTMLTableElement | null>;
  editedRow: Record<number, ScalarObject>;
  onEditCell: (props: EditHandlerProps) => void;
};

export const TableContainer = ({
  cols,
  rows,
  columnsOrder,
  store,
  outerRef,
  editedRow,
  onEditCell,
}: TableContainerProps) => {
  // const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const { useStore } = store;
  const { hasSelects, clearSelected, setSelectedRow, selectedRows } = useStore(
    ({ state, api }) => ({
      hasSelects: state.selectedRows.size > 0,
      clearSelected: api.clearSelected,
      setSelectedRow: api.setSelectedRow,
      selectedRows: state.selectedRows,
    }),
  );

  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const { colWidths, startResize } = useColumnResize(
    columnsOrder,
    outerRef,
    resizeLineRef,
  );

  return (
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
            ? 'changed'
            : idx % 2 === 0
              ? 'even'
              : 'odd';
          return (
            <tr key={`row-${uid}`} className={`${rowBg}`}>
              <td>
                <Checkbox
                  checked={selectedRows.has(uid)}
                  onChange={(checked) => {
                    setSelectedRow(uid, checked);
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
                      onEditCell({
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
  );
};
