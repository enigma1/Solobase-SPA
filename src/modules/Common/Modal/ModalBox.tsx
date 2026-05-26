import { Children, isValidElement, ReactNode, useEffect, useRef } from 'react';

type ModalCompoundComponent = React.FC<ModalBoxProps> & {
  Caption: React.FC<{ children: ReactNode }>;
  Content: React.FC<{ children: ReactNode }>;
  Controls: React.FC<{ children: ReactNode }>;
};

type ModalBoxProps = {
  isOpen: boolean;
  loading?: boolean;
  loadingBody?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const Caption = ({ children }: { children: ReactNode }) => (
  <div className='caption'>{children}</div>
);

const Content = ({ children }: { children: ReactNode }) => (
  <div className='content'>{children}</div>
);

const Controls = ({ children }: { children: ReactNode }) => (
  <div className='controls'>{children}</div>
);

export const ModalBox: ModalCompoundComponent = ({
  isOpen,
  onClose,
  loading,
  loadingBody,
  children,
}) => {
  const childArray = Children.toArray(children);

  const caption = childArray.find(
    (child) => isValidElement(child) && child.type === ModalBox.Caption,
  );

  const rest = childArray.filter(
    (child) => !isValidElement(child) || child.type !== ModalBox.Caption,
  );

  const modalRef = useRef<HTMLDialogElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    e.stopPropagation();
    // if (e.target === modalRef.current) onClose();
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('test-clicks', e.target === modalRef.current);
  };

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <div className='dialog-container' onClick={handleContainerClick}>
      <dialog
        ref={modalRef}
        onClick={handleClick}
        onCancel={onClose}
        className='dialog'
      >
        {caption}
        {loading ? (
          <div className='loading'>{loadingBody ?? 'Please wait...'}</div>
        ) : (
          rest
        )}
      </dialog>
    </div>
  );
};

ModalBox.Caption = Caption;
ModalBox.Content = Content;
ModalBox.Controls = Controls;
