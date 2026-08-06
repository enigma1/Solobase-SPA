import { useState, useMemo, type RefObject } from 'react';
import {
  SquarePenIcon,
  PencilLineIcon,
  CopyIcon,
  TextSearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SquareXIcon,
} from 'lucide-react';
import { useColumnResize } from '>/services/hooks';
import type { FactoryTableStore } from '>/services/stores';
import {
  ViewRow,
  SqlObject,
  SqlColumnsShape,
  SqlRow,
  ColumnActions,
  ActionColumnProps,
  FilterColumnParams,
  ActionOptions,
} from '>/types';
import { getMergedSqlColumnData } from '>/services/utils';
import { CheckboxField, DropdownMenu } from '>/modules';

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
  filters?: Record<string, FilterColumnParams[]>;
  columnActions?: Record<string, ColumnActions>;
  selectedRow?: string;
  actionOptions?: ActionOptions[];
  onActionCol?: (actionsColumn: ActionColumnProps) => void;
  onEditCell?: (props: EditHandlerProps) => void;
  onEditRow?: (uid: string) => void;
  onSelectRow?: (uid: string) => void;
  onCopyRow?: (uid: string) => void;
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
  filters,
  columnActions,
  actionOptions,
  onActionCol,
  onEditCell,
  onEditRow,
  onSelectRow,
  onCopyRow,
}: SqlTableContainerProps) => {
  const hasActions = actionOptions?.length;
  const { useFactoryTableStore } = store;
  const [copiedRow, setCopiedRow] = useState<string | null>(null);
  const [openColumnMenu, setOpenColumnMenu] = useState<string | null>(null);

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

  const handleCopyRow = (uid: string) => {
    setCopiedRow(uid);
    onCopyRow?.(uid);

    setTimeout(() => {
      setCopiedRow(null);
    }, 700);
  };

  const isEditable = onEditCell;

  return (
    <table className='table' ref={tableRef}>
      <thead>
        <tr>
          <th />
          {activeCols.map((colName) => {
            const cActions = columnActions?.[colName];
            const colData = cols[colName];
            const title = `type: ${colData.type} / nullable: ${colData.nullable} / key: ${colData.key} / default: ${colData.defaultValue} / extra: ${colData.extra}`;
            const actionsClass = filters?.[colName] ? 'show-active' : '';
            const borderClass =
              cActions?.sort === 'asc'
                ? 'sortable asc'
                : cActions?.sort === 'desc'
                  ? 'sortable desc'
                  : '';
            return (
              <th
                key={`col-${colName}`}
                className={`${cActions ? 'actionable' : undefined} ${actionsClass}`}
                title={title}
                style={{ width: `${colWidths[colName]}px` }}
              >
                <div className={`col-header ${borderClass}`}>
                  <span className='truncate'>{colName}</span>
                </div>

                {cActions?.sort && (
                  <div className='actions-right'>
                    <button
                      className={`btn p-0 action ${cActions.sort === 'asc' ? 'emphasize' : ''}`}
                      onClick={() =>
                        onActionCol?.({
                          colName,
                          actions: {
                            type: cols[colName].type,
                            sort: cActions.sort === 'asc' ? 'both' : 'asc',
                          },
                        })
                      }
                    >
                      <ChevronUpIcon size={18} />
                    </button>
                    <button
                      className={`btn p-0 action ${cActions.sort === 'desc' ? 'emphasize' : ''}`}
                      onClick={() =>
                        onActionCol?.({
                          colName,
                          actions: {
                            type: cols[colName].type,
                            sort: cActions.sort === 'desc' ? 'both' : 'desc',
                          },
                        })
                      }
                    >
                      <ChevronDownIcon size={18} />
                    </button>
                  </div>
                )}

                {hasActions && (
                  <>
                    <button
                      className='btn p-0 action actions-left'
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenColumnMenu((current) =>
                          current === colName ? null : colName,
                        );
                      }}
                    >
                      <TextSearchIcon size={18} />
                    </button>

                    <DropdownMenu
                      open={openColumnMenu === colName}
                      onOpenChange={(open) => {
                        setOpenColumnMenu(open ? colName : null);
                      }}
                    >
                      {actionOptions.map((item) => {
                        const active = filters?.[colName]?.some((f) => {
                          return f.mode === item.action;
                        });
                        return (
                          <button
                            key={item.action}
                            className='relative menu-item'
                            onClick={() => {
                              onActionCol?.({
                                colName,
                                actions: {
                                  type: colData.type,
                                  filter: {
                                    mode: item.action,
                                    value: active ? undefined : null,
                                  },
                                },
                              });
                            }}
                          >
                            {active && (
                              <SquareXIcon className='left-1 absolute field-info' />
                            )}
                            {item.option}
                          </button>
                        );
                      })}
                    </DropdownMenu>
                  </>
                )}

                <div
                  onPointerDown={(e) => startResize(e, colName)}
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
              className={`${rowBg} ${copiedRow === uid ? 'copied-flash' : ''}`}
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
                  {onCopyRow && (
                    <button
                      title='Copy this row'
                      className='btn-secondary p-0 bg-transparent border-0'
                      onClick={() => {
                        handleCopyRow(uid);
                      }}
                    >
                      <CopyIcon size={18} className='inline-block' />
                    </button>
                  )}
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
