import { Fragment, useMemo, useState, useEffect, useRef } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react-dom';
import { ChevronLeftIcon } from 'lucide-react';
import { StatusType } from '>/types';

type Option = {
  value: string;
  label?: string;
  disabled?: boolean;
  $editable?: boolean;
};

type OptionGroup = {
  label: string;
  options: Option[];
};

type ComboBoxProps = {
  id?: string;
  value?: string;
  $editable?: boolean;
  $placeholder?: string;
  $status?: StatusType;
  onChange: (value: string) => void;
  $options?: Option[];
  $groups?: OptionGroup[];
  // $open?: boolean;
  // $onOpenChange?: (open: boolean) => void;
  $defaultOpen?: boolean;
};

export const ComboBox = ({
  id,
  value,
  onChange,
  $options = [],
  $groups = [],
  $editable = true,
  $placeholder = 'Select...',
  $status,
  // $open,
  // $onOpenChange,
  $defaultOpen,
}: ComboBoxProps) => {
  const [internalOpen, setInternalOpen] = useState($defaultOpen ?? false);
  const [menuWidth, setMenuWidth] = useState<number>();
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLUListElement>(null);
  // const currentOpen = $open ?? internalOpen;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedReference = ref.current?.contains(target);
      const clickedFloating = floatingRef.current?.contains(target);

      if (!clickedReference && !clickedFloating) {
        setInternalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    setMenuWidth(ref.current.offsetWidth);
  }, [internalOpen]);

  // useEffect(() => {
  //   console.log('Is updating comboBox value:', value);
  // }, [value]);

  const flatOptions = useMemo(() => {
    if ($options.length) return $options;

    return $groups.flatMap((g) => g.options);
  }, [$options, $groups]);

  const selected = useMemo(
    () => flatOptions.find((o) => o.value === value),
    [flatOptions, value],
  );

  const filtered = useMemo(() => {
    return $options.filter((o) =>
      (o.label ?? o.value).toLowerCase().includes(query.toLowerCase()),
    );
  }, [$options, query]);

  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase();

    return $groups
      .map((group) => ({
        ...group,
        options: group.options.filter((o) =>
          (o.label ?? o.value).toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [$groups, query]);

  // Floating UI setup
  const { refs, floatingStyles } = useFloating({
    strategy: 'fixed',
    middleware: [offset(0), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const getFlatList = (flatList: Option[]) => {
    return flatList.map((o) => (
      <li
        className='option'
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
    ));
  };

  const getGroupList = (groupList: OptionGroup[]) => {
    return groupList.map((g) => (
      <Fragment key={g.label}>
        <li className='group'>{g.label}</li>
        {getFlatList(g.options)}
      </Fragment>
    ));
  };

  const isReadOnly = !$editable;
  const useGroups = $groups.length > 0;
  const items = useGroups ? filteredGroups : filtered;
  const isEmpty = items.length === 0;
  const hasItems = !isEmpty;

  console.log('combobox-render', {
    value,
    selected,
    query,
    internalOpen,
  });
  return (
    <div
      className='combo-shell'
      title={$placeholder}
      data-status={$status}
      ref={(node) => {
        ref.current = node;
        refs.setReference(node);
      }}
    >
      <input
        id={id}
        value={
          internalOpen ? query : (selected?.label ?? selected?.value ?? '')
        }
        onFocus={() => setInternalOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setInternalOpen(true);
        }}
        placeholder={isEmpty ? 'No options' : $placeholder}
        className={`combo-input`}
        data-read-only={isReadOnly}
        readOnly={isReadOnly}
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

      {internalOpen && hasItems && (
        <ul
          ref={(node) => {
            refs.setFloating(node);
            floatingRef.current = node;
          }}
          style={{
            ...floatingStyles,
            width: menuWidth,
          }}
          className='combo-menu'
        >
          {useGroups ? getGroupList(filteredGroups) : getFlatList(filtered)}
        </ul>
      )}
    </div>
  );
};
