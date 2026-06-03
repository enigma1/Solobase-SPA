import { useMemo, type RefObject } from 'react';
import { SquarePenIcon, PencilLineIcon } from 'lucide-react';
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
  activeCols: string[];
  columnsOrder: string[];
  store: UiTableStore;
  outerRef: RefObject<HTMLDivElement | null>;
  tableRef: React.RefObject<HTMLTableElement | null>;
  resizeLineRef: RefObject<HTMLDivElement | null>;
  editedRow: Record<number, ScalarObject>;
  onEditCell?: (props: EditHandlerProps) => void;
  onEditRow?: (uid: number) => void;
};

export const TableContainer = ({
  cols,
  rows,
  columnsOrder,
  activeCols,
  store,
  outerRef,
  resizeLineRef,
  tableRef,
  editedRow,
  onEditCell,
  onEditRow,
}: TableContainerProps) => {
  // const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const { useStore } = store;
  const columnIndices = useMemo(
    () => Object.fromEntries(columnsOrder.map((name, idx) => [name, idx])),
    [columnsOrder],
  );

  const { setSelectedRow, selectedRows } = useStore(({ state, api }) => ({
    setSelectedRow: api.setSelectedRow,
    selectedRows: state.selectedRows,
  }));

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
              <td className='align-middle'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    checked={selectedRows.has(uid)}
                    onChange={(checked) => {
                      setSelectedRow(uid, checked);
                    }}
                  />
                  {onEditRow && (
                    <button
                      className='btn-secondary p-0'
                      onClick={() => onEditRow(uid)}
                    >
                      <PencilLineIcon size={18} className='inline-block' />
                    </button>
                  )}
                </div>
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
                    className={`editable ${editedRow?.[uid]?.[colIndex] ? 'selected' : ''}`}
                  >
                    {getValue()}
                    {onEditCell && (
                      <button
                        className='btn p-0 edit'
                        onClick={() =>
                          onEditCell({
                            row: [...row],
                            rId: uid,
                            cId: colIndex,
                            colName,
                          })
                        }
                      >
                        <SquarePenIcon size={18} />
                      </button>
                    )}
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
