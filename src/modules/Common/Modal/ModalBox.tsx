import { Children, isValidElement, ReactNode, useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { useModal } from '>/services/hooks';
import { dialogSizes } from '>/services/utils';

type ModalCompoundComponent = React.FC<ModalBoxProps> & {
  Caption: React.FC<{ children: ReactNode }>;
  Content: React.FC<{ children: ReactNode }>;
  Controls: React.FC<{ children: ReactNode }>;
};

type ModalBoxProps = {
  loading?: boolean;
  loadingBody?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const Caption = ({ children }: { children: ReactNode }) => {
  const { onClose, variant } = useModal();

  return (
    <div className={`caption ${variant}`}>
      <div className='caption-title'>{children}</div>
      <button className='btn-secondary' onClick={onClose}>
        <XIcon size={16} />
      </button>
    </div>
  );
};

const Content = ({ children }: { children: ReactNode }) => (
  <div className='content'>{children}</div>
);

const Controls = ({ children }: { children: ReactNode }) => {
  return Children.count(children) > 0 ? (
    <div className='controls'>{children}</div>
  ) : null;
};

export const ModalBox: ModalCompoundComponent = ({
  // isOpen,
  onClose,
  loading,
  loadingBody,
  children,
}) => {
  const { initialSize } = useModal();
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
  };

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  return (
    <div className='dialog-container'>
      <dialog
        ref={modalRef}
        onClick={handleClick}
        onCancel={onClose}
        className={`dialog ${dialogSizes[initialSize ?? 'sm']}`}
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
