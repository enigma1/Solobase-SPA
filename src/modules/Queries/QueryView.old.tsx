import { useRef, useEffect } from 'react';
import { queryKeys, useQueryDataHook } from '>/services/queryHooks';
import {
  useErrorDialog,
  useColumnResize,
  useEffectiveTableWidth,
} from '>/services/hooks';
import { useHistoryStore } from '>/services/stores';
import { EffectiveTableWrapper, ScreenLoader } from '>/modules';

export const QueryView = () => {
  const resizeLineRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const { withErrorDialog } = useErrorDialog();
  const { getQuery } = useHistoryStore(({ api }) => ({
    getQuery: api.getQuery,
  }));

  const { data, isLoading, isSuccess, isError } = useQueryDataHook(
    ({ state, query }) => ({
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
      isError: query.isError,
      data: state,
    }),
  );

  // if (isLoading) return <Spinner />;
  // if (isError) return <ErrorView />;

  const { query, truncated, cols, rows, columnsOrder } = data ?? {
    rows: [],
    cols: {},
    query: '',
    truncated: false,
    columnsOrder: [],
  };

  const outerRef = useRef<HTMLDivElement>(null);
  const { colWidths, startResize } = useColumnResize(
    columnsOrder,
    outerRef,
    resizeLineRef,
  );
  const effectiveWidth = useEffectiveTableWidth({
    outerRef,
    colWidths,
    columnsOrder,
  });

  useEffect(() => {
    if (isError) {
      withErrorDialog(
        () =>
          Promise.reject(
            new Error('Query failed, check your connection and query syntax'),
          ),
        'Query Execution Error',
        'commonError',
      );
    }
  }, [isError]);

  if (isLoading) {
    return '<div>No data to display yet</div>';
  }

  return (
    <>
      <EffectiveTableWrapper
        outerRef={outerRef}
        resizeLineRef={resizeLineRef}
        tableRef={tableRef}
      >
        <div className='sticky top-0 z-10 p-2 bg-gray-100 text-gray-700'>
          <div className='flex justify-between items-center'>
            <h3 className='font-semibold text-lg'>
              {`${query ? 'Executed [' + query + ']: ' : 'No Query selected'} ${rows.length ? rows.length + ' rows' : ''}`}
            </h3>
          </div>
        </div>
        <table
          ref={tableRef}
          className='w-full border-separate border-spacing-0 table-fixed'
        >
          <thead>
            <tr>
              {columnsOrder.map((colName, idx) => {
                const colData = cols[colName];
                const title = `type: ${colData?.type} / nullable: ${colData?.nullable} / key: ${colData?.key} / default: ${colData?.defaultValue} / extra: ${colData?.extra}`;
                return (
                  <th
                    key={`col-${colName}-${idx}`}
                    className='sticky top-0 bg-gray-200 p-2 text-left text-sm font-medium'
                    title={title}
                  >
                    {colName}
                    <div
                      className='cursor-ew-resize'
                      onMouseDown={(e) => startResize(e, colName)}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              return (
                <tr
                  key={`row-${idx}`}
                  className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  {columnsOrder.map((_, colIndex) => {
                    const getValue = () => {
                      const value = row[colIndex];
                      if (value === null) return 'NULL';
                      if (typeof value === 'object') {
                        return <pre>{JSON.stringify(value, null, 2)}</pre>;
                      }
                      if (typeof value === 'bigint') {
                        return value.toString();
                      }
                      return String(value);
                    };
                    return (
                      <td key={colIndex} className='p-2 text-sm'>
                        {getValue()}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {isLoading && <ScreenLoader />}
      </EffectiveTableWrapper>
    </>
  );
};
