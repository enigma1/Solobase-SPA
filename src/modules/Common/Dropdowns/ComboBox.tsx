import { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon } from 'lucide-react';
import { StatusType } from '>/types';

type Option = {
  value: string;
  label?: string;
  disabled?: boolean;
  $editable?: boolean;
};

type ComboBoxProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  $options?: Option[];
  $editable?: boolean;
  $placeholder?: string;
  $status?: StatusType;
  // $open?: boolean;
  // $onOpenChange?: (open: boolean) => void;
  $defaultOpen?: boolean;
};

export const ComboBox = ({
  id,
  value,
  onChange,
  $options = [],
  $editable = false,
  $placeholder = 'Select...',
  $status,
  // $open,
  // $onOpenChange,
  $defaultOpen,
}: ComboBoxProps) => {
  const [internalOpen, setInternalOpen] = useState($defaultOpen ?? false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  // const currentOpen = $open ?? internalOpen;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setInternalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = useMemo(
    () => $options.find((o) => o.value === value),
    [$options, value],
  );

  const filtered = useMemo(() => {
    return $options.filter((o) =>
      (o.label ?? o.value).toLowerCase().includes(query.toLowerCase()),
    );
  }, [$options, query]);

  const isEmpty = $options.length === 0;

  return (
    <div
      className={`combo-shell`}
      title={$placeholder}
      data-status={$status}
      ref={ref}
    >
      <input
        id={id}
        value={internalOpen ? query : (selected?.label ?? '')}
        onFocus={() => setInternalOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setInternalOpen(true);
        }}
        placeholder={isEmpty ? 'No options' : $placeholder}
        className={`combo-input`}
        data-read-only={isEmpty ?? !$editable}
        readOnly={isEmpty ?? !$editable}
      />

      {!isEmpty && (
        <button
          type='button'
          className='combo-button'
          onClick={() => setInternalOpen((v) => !v)}
        >
          <ChevronLeftIcon
            size={20}
            className={`icon-muted transition-transform duration-200 ${
              internalOpen ? '-rotate-90' : ''
            }`}
          />
        </button>
      )}

      {internalOpen && filtered.length > 0 && (
        <ul className='combo-menu'>
          {filtered.map((o) => (
            <li
              data-disabled={o.disabled || undefined}
              key={o.value}
              onMouseDown={() => {
                onChange(o.value);
                setQuery('');
                setInternalOpen(false);
              }}
            >
              {o.label ?? o.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
