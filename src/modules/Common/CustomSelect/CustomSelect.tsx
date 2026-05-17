import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { useMemo } from 'react';

type Option = {
  value: string;
  label?: string;
  disabled?: boolean;
};

type Props = {
  value?: string;
  onChange: (value: string) => void;
  $options?: Option[];
  $placeholder?: string;
  $error?: boolean;
};

export const CustomSelect = ({
  value,
  onChange,
  $options = [],
  $placeholder = 'Select...',
  $error,
}: Props) => {
  const selected = useMemo(
    () => $options.find((o) => o.value === value),
    [$options, value],
  );

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className='listbox-button-wrapper'>
          <ListboxButton
            className='listbox-button'
            data-error={$error || undefined}
            data-placeholder={!selected ? true : undefined}
          >
            <span>{selected?.label ?? selected?.value ?? $placeholder}</span>
            {open ? (
              <ChevronUpIcon className='listbox-chevron' />
            ) : (
              <ChevronDownIcon className='listbox-chevron' />
            )}
          </ListboxButton>

          <ListboxOptions className='listbox-options'>
            {$options.map((o) => (
              <ListboxOption
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className='listbox-option'
              >
                {o.label ?? o.value}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      )}
    </Listbox>
  );
};
