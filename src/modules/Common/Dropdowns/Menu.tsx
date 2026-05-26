import { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
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
      <button onClick={() => setOpen((v) => !v)} className='menu-trigger'>
        {label}
      </button>

      {open && <div className='menu-panel'>{children}</div>}
    </div>
  );
};
