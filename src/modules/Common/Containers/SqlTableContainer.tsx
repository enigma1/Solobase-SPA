import { useMemo, type RefObject } from 'react';
import { SquarePenIcon, PencilLineIcon } from 'lucide-react';
import { useColumnResize } from '>/services/hooks';
import type { FactoryTableStore } from '>/services/stores';
import { ViewRow, SqlTypes, SqlObject, SqlColumnsShape, SqlRow } from '>/types';
import { getMergedSqlColumnData } from '>/services/utils';
import { CheckboxField } from '>/modules';

type EditHandlerProps = {
  row: SqlRow;
  rId: number;
  cId: number;
  colName: string;
};

type SqlTableContainerProps = {
  rows: ViewRow<SqlRow>[];
  cols: SqlColumnsShape;
  columnsOrder: string[];
  activeCols: string[];
  store: FactoryTableStore;
  outerRef: RefObject<HTMLDivElement | null>;
  tableRef: React.RefObject<HTMLTableElement | null>;
  resizeLineRef: RefObject<HTMLDivElement | null>;
  editedRow?: Record<string, SqlObject>;
  selectedRow?: string;
  onEditCell?: (props: EditHandlerProps) => void;
  onEditRow?: (uid: string) => void;
  onSelectRow?: (uid: string) => void;
};

export const SqlTableContainer = ({
  cols,
  rows,
  columnsOrder,
  activeCols,
  store,
  outerRef,
  resizeLineRef,
  tableRef,
  editedRow,
  selectedRow,
  onEditCell,
  onEditRow,
  onSelectRow,
}: SqlTableContainerProps) => {
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
            const colData = cols[colName];
            const title = `type: ${colData?.type} / nullable: ${colData?.nullable} / key: ${colData?.key} / default: ${colData?.defaultValue} / extra: ${colData?.extra}`;
            return (
              <th
                key={`col-${colName}`}
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
          const isSelected = selectedRows && uid === selectedRow;
          const row = editedRow
            ? getMergedSqlColumnData(oRow.row, editedRow[uid])
            : oRow.row;
          const rowBg = editedRow?.[uid]
            ? 'changed'
            : idx % 2 === 0
              ? 'even'
              : 'odd';
          return (
            <tr
              key={`row-${uid}-${idx}`}
              className={`${rowBg}`}
              onClick={() => {
                onSelectRow?.(uid);
              }}
              data-active={isSelected}
            >
              <td className='align-middle' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center gap-2'>
                  <CheckboxField
                    wrapLayout='stack'
                    checked={selectedRows.has(uid)}
                    onChange={(checked) => {
                      setSelectedRow(uid, checked);
                    }}
                  />
                  {onEditRow && (
                    <button
                      className='btn-secondary p-0 bg-transparent border-0'
                      onClick={(e) => {
                        onEditRow(uid);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCell({
                          row: [...row],
                          rId: Number(uid),
                          cId: colIndex,
                          colName,
                        });
                      }}
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
