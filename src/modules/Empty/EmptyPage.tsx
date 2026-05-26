import { ReactNode } from 'react';

export const EmptyPage = ({
  note,
  children,
}: {
  note?: string;
  children?: ReactNode;
}) => {
  return (
    <div className='page-container'>
      <div className='page-toolbar'>
        <div className='page-title'>{note || 'No data available.'}</div>
        {children}
      </div>
    </div>
  );
};
