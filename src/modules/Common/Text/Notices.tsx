import { FactoryTableStore, dialogStoreActions } from '>/services/stores';
import { DialogContent } from '>/modules';
import { dialogActions } from '>/services/utils';
import { dialogFactories } from '>/modules';

type NoticeProps = {
  store: FactoryTableStore;
};
const FiltersNotice = ({ store }: NoticeProps) => {
  const handleClear = () =>
    dialogStoreActions.openDialog({
      payload: dialogFactories.confirmation({
        caption: 'Query Filters',
        note: 'Remove Filters',
        message:
          "All filters will be removed from the table's columns. Are you sure?",
        onConfirm: () => store.api.clearFilters(),
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

const SortsNotice = ({ store }: NoticeProps) => {
  const handleClear = () =>
    dialogStoreActions.openDialog({
      payload: dialogFactories.confirmation({
        caption: 'Query Sort',
        note: 'Remove Sorting',
        message: 'Sorting will be removed from all columns. Are you sure?',
        onConfirm: () => store.api.clearSorts(),
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
  store,
  clearFilters,
  clearSorts,
}: FiltersAndSortsNotice) => {
  return (
    <div className='inline-wrapper'>
      {clearFilters && <FiltersNotice store={store} />}
      {clearSorts && <SortsNotice store={store} />}
    </div>
  );
};
