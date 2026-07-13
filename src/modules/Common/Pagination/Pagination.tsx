import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type PaginationProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export const Pagination = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: PaginationProps) => {
  return (
    <div className='segment-toolbar'>
      <button
        className='btn-micro'
        onClick={onPrevious}
        disabled={!hasPrevious}
        title='Previous Page'
      >
        <ChevronLeftIcon size={18} />
      </button>

      <button
        className='btn-micro'
        onClick={onNext}
        disabled={!hasNext}
        title='Next Page'
      >
        <ChevronRightIcon size={18} />
      </button>
    </div>
  );
};
