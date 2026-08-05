import { useState, useRef, useEffect } from 'react';

type DropDownMenuProps = {
  label?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export const DropdownMenu = ({
  label,
  children,
  disabled,
  title,
  open,
  onOpenChange,
}: DropDownMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const ref = useRef<HTMLDivElement>(null);

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className='menu-dropdown' title={title} ref={ref}>
      {label && (
        <button
          data-disabled={disabled ? 'true' : undefined}
          onClick={() => setOpen(!isOpen)}
          className='menu-trigger'
        >
          {label}
        </button>
      )}

      {isOpen && <div className='menu-panel'>{children}</div>}
    </div>
  );
};
