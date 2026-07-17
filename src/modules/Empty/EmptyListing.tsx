import { ReactNode } from 'react';
import { MapPlusIcon, SquareArrowLeftIcon } from 'lucide-react';

type EmptyPageProps = {
  note?: string;
  children?: ReactNode;
  onCreate: () => void;
  onBack?: () => void;
};

export const EmptyListing = ({
  note,
  children,
  onCreate,
  onBack,
}: EmptyPageProps) => {
  return (
    <div className='page-top-container'>
      <div className='page-toolbar'>
        <div className='page-title'>
          {onBack && (
            <button className='btn-micro' onClick={onBack} title='Go Back'>
              <SquareArrowLeftIcon size={18} />
            </button>
          )}
          {note || 'No data available.'}
        </div>
        <div className='page-actions'>
          <button className='btn' onClick={onCreate} title='Insert Entries'>
            <MapPlusIcon size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
