import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

type PaginationProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  currentSet: string;
};

export const SidePagination = ({
  hasPrevious,
  hasNext,
  onPreviousPage,
  onNextPage,
  currentSet,
}: PaginationProps) => {
  return (
    <div className='side-toolbar'>
      <button
        className='btn-micro'
        onClick={onPreviousPage}
        disabled={!hasPrevious}
        title='Previous Page'
      >
        <ChevronUpIcon size={18} />
      </button>
      <div className='label'>{currentSet}</div>
      <button
        className='btn-micro'
        onClick={onNextPage}
        disabled={!hasNext}
        title='Next Page'
      >
        <ChevronDownIcon size={18} />
      </button>
    </div>
  );
};
