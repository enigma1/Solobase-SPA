import { dialogStoreActions, columnsStoreActions } from '>/services/stores';
import { dialogActions } from '>/services/utils';
import { dialogFactories } from '>/modules';
import { SqlColumnsShape } from '>/types';

type NoticeProps = {
  cols: SqlColumnsShape;
};
const FiltersNotice = ({ cols }: NoticeProps) => {
  const handleClear = () =>
    dialogStoreActions.openDialog({
      payload: dialogFactories.confirmation({
        caption: 'Query Filters',
        note: 'Remove Filters',
        message:
          "All filters will be removed from the table's columns. Are you sure?",
        onConfirm: () => {
          columnsStoreActions.clearFilters(cols);
        },
      }),
    });

  return (
    <p className='stand'>
      Column Filters are present, click{' '}
      <button type='button' className='btn-link' onClick={handleClear}>
        here
      </button>{' '}
      to remove them.
    </p>
  );
};

const SortsNotice = ({ cols }: NoticeProps) => {
  const handleClear = () =>
    dialogStoreActions.openDialog({
      payload: dialogFactories.confirmation({
        caption: 'Query Sort',
        note: 'Remove Sorting',
        message: 'Sorting will be removed from all columns. Are you sure?',
        onConfirm: () => {
          columnsStoreActions.clearSorts(cols);
        },
      }),
    });

  return (
    <p className='stand'>
      Sorting is applied, click{' '}
      <button type='button' className='btn-link' onClick={handleClear}>
        here
      </button>{' '}
      to clear it.
    </p>
  );
};

type FiltersAndSortsNotice = NoticeProps & {
  clearFilters?: boolean;
  clearSorts?: boolean;
};
export const FiltersAndSortsNotice = ({
  cols,
  clearFilters,
  clearSorts,
}: FiltersAndSortsNotice) => {
  return (
    <div className='inline-wrapper'>
      {clearFilters && <FiltersNotice cols={cols} />}
      {clearSorts && <SortsNotice cols={cols} />}
    </div>
  );
};
