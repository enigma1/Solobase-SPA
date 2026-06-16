import { ReactNode } from 'react';
import { MapPlusIcon } from 'lucide-react';

type EmptyPageProps = {
  note?: string;
  children?: ReactNode;
  onCreate: () => void;
};

export const EmptyListing = ({ note, children, onCreate }: EmptyPageProps) => {
  return (
    <div className='page-container'>
      <div className='page-toolbar'>
        <div className='page-title'>{note || 'No data available.'}</div>
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
