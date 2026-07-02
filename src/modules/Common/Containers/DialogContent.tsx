import { ReactNode } from 'react';

export const DialogContent = ({
  note,
  children,
}: {
  note?: string;
  children?: ReactNode;
}) => {
  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <div className='area-title'>{note || 'No details available.'}</div>
      </div>
      <div className='area-content'>{children}</div>
    </div>
  );
};
