import { ReactNode } from 'react';
import { PanelTopCloseIcon } from 'lucide-react';

type DialogContentProps = {
  note?: string;
  children?: ReactNode;
  className?: string;
  classSpacer?: string;
  onClose?: () => void;
};
export const DialogContent = ({
  note,
  children,
  onClose,
  className,
  classSpacer,
}: DialogContentProps) => {
  return (
    <div className={`area-container ${className}`}>
      <div className={`area-spacer ${classSpacer}`}>
        <div className='area-title'>{note || 'No details available.'}</div>
        {onClose && (
          <div className='area-actions'>
            <button
              type='button'
              className='btn'
              onClick={onClose}
              title='Close'
            >
              <PanelTopCloseIcon size={24} />
            </button>
          </div>
        )}
      </div>
      <div className='area-content'>{children}</div>
    </div>
  );
};
