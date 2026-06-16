import { useMemo, type RefObject } from 'react';
import { SquarePenIcon, PencilLineIcon } from 'lucide-react';
import { useColumnResize } from '>/services/hooks';
import { Checkbox } from '>/modules';
import { getMergedSimpleColumnData } from '>/services/utils';
import { ViewRow, ScalarObject, Scalar, PrimeRow } from '>/types';
import type { FactoryTableStore } from '>/services/stores';

type EditHandlerProps = {
  row: Scalar[];
  rId: number;
  cId: number;
  colName: string;
};

type SimpleTableContainerProps = {
  rows: ViewRow<PrimeRow>[];
  activeCols: string[];
  columnsOrder: string[];
  store: FactoryTableStore;
  outerRef: RefObject<HTMLDivElement | null>;
  tableRef: React.RefObject<HTMLTableElement | null>;
  resizeLineRef: RefObject<HTMLDivElement | null>;
  editedRow?: Record<number, ScalarObject>;
  onEditCell?: (props: EditHandlerProps) => void;
  onEditRow?: (uid: number) => void;
};

export const SimpleTableContainer = ({
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
}: SimpleTableContainerProps) => {
  // const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const { useFactoryTableStore } = store;
  const columnIndices = useMemo(
    () => Object.fromEntries(columnsOrder.map((name, idx) => [name, idx])),
    [columnsOrder],
  );

  const { setSelectedRow, selectedRows } = useFactoryTableStore(
    ({ state, api }) => ({
      setSelectedRow: api.setSelectedRow,
      selectedRows: state.selectedRows,
    }),
  );

  const { colWidths, startResize } = useColumnResize(
    columnsOrder,
    outerRef,
    resizeLineRef,
  );
  const isEditable = onEditCell;
  return (
    <table className='table' ref={tableRef}>
      <thead>
        <tr>
          <th />
          {activeCols.map((colName) => {
            return (
              <th
                key={`col-${colName}`}
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
          const row = getMergedSimpleColumnData(oRow.row, editedRow?.[uid]);
          const rowBg = editedRow?.[uid]
            ? 'changed'
            : idx % 2 === 0
              ? 'even'
              : 'odd';
          return (
            <tr key={`row-${uid}-${idx}`} className={`${rowBg}`}>
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
                      className='btn-secondary p-0 bg-transparent border-0'
                      onClick={() => onEditRow(uid)}
                    >
                      <PencilLineIcon size={18} className='inline-block' />
                    </button>
                  )}
                </div>
              </td>
              {activeCols.map((colName) => {
                const colIndex = columnIndices[colName];
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

                return isEditable ? (
                  <td
                    key={colIndex}
                    className={`editable ${editedRow?.[uid]?.[colIndex] ? 'selected' : ''}`}
                  >
                    {getValue()}

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
                  </td>
                ) : (
                  <td key={colIndex}>{getValue()}</td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
