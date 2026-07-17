import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useConfigStore } from '>/services/stores';
import { useDatabases, useSelectDatabaseWrap } from '>/services/queryHooks';
import { ComboField, Spinner } from '>/modules';
import { ListScrollInfo } from '>/types';

type DatabaseComboProps = {
  id?: string;
  label?: string;
  $placeholder?: string;
  onChange?: (dbSelected: string) => void;
  selectedDatabase: string;
};
export const DatabaseCombo = ({
  id,
  label,
  selectedDatabase,
  $placeholder,
  onChange,
}: DatabaseComboProps) => {
  const [offset, setOffset] = useState<number>(0);
  const [names, setNames] = useState<string[]>([]);

  const { rowsLimit } = useConfigStore(({ state, api }) => ({
    rowsLimit: state.pageSizes.dbRows,
  }));

  const { isFetching, isSuccess, getDbNames, responsePaging } = useDatabases(
    { paging: { limit: rowsLimit, offset } },
    ({ api, state, query }) => {
      return {
        getDbNames: api.getDbNames,
        responsePaging: state.paging,
        isSuccess: query.isSuccess,
        isError: query.isError,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
      };
    },
  );

  useEffect(() => {
    setOffset(0);
    setNames([]);
  }, [rowsLimit]);

  useEffect(() => {
    if (!isSuccess) return;

    const names = getDbNames();
    setNames((prev) => {
      const merged = offset === 0 ? names : [...prev, ...names];
      return [...new Set(merged)] as string[];
    });
  }, [isSuccess, offset]);

  const { mutateAsync, isPending } = useSelectDatabaseWrap();

  const handleChange = async (db: string | string[]) => {
    const database = db as string;
    await mutateAsync({ database });
    onChange?.(database as string);
  };

  const handleScroll = (info: ListScrollInfo) => {
    if (isFetching || !responsePaging?.hasNext) return;
    const remaining = info.scrollHeight - info.scrollTop - info.clientHeight;
    if (remaining < info.clientHeight) {
      setOffset((prev) => prev + rowsLimit);
    }
  };

  const isBusy = isFetching || isPending;
  return (
    <>
      <ComboField
        $editable={false}
        id={id ?? 'database-combo'}
        label={label ?? 'Database:'}
        value={selectedDatabase}
        onChange={handleChange}
        onListScroll={handleScroll}
        $options={names.map((db: string) => ({
          value: db,
          label: db,
        }))}
        $placeholder={$placeholder ?? 'Select Database'}
      />
      {isBusy && <Spinner />}
    </>
  );
};
