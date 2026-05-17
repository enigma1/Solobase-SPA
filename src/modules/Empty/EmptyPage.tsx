import { ReactNode } from 'react';

export const EmptyPage = ({
  note,
  children,
}: {
  note?: string;
  children?: ReactNode;
}) => {
  return (
    <div className='w-full p-8 bg-gray-50 rounded-lg shadow-md'>
      <h3 className='text-2xl font-semibold text-gray-800'>
        {note || 'No data available.'}
      </h3>
      {children}
    </div>
  );
};
