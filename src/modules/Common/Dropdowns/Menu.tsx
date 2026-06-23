import { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({
  label,
  children,
  disabled,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='menu-dropdown' ref={ref}>
      <button
        data-disabled={disabled ? 'true' : undefined}
        onClick={() => setOpen((v) => !v)}
        className='menu-trigger'
      >
        {label}
      </button>

      {open && <div className='menu-panel'>{children}</div>}
    </div>
  );
};
