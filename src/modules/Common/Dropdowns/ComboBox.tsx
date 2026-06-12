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
  value?: string | string[];
  $editable?: boolean;
  $multiple?: boolean;
  $placeholder?: string;
  $status?: StatusType;
  onChange: (value: string | string[]) => void;
  $options?: Option[];
  $groups?: OptionGroup[];
  // $open?: boolean;
  // $onOpenChange?: (open: boolean) => void;
  $defaultOpen?: boolean;
};

export const ComboBox = (props: ComboBoxProps) => {
  const {
    id,
    value,
    $options = [],
    $groups = [],
    $editable = true,
    $multiple = false,
    $placeholder = 'Select...',
    $status,
    // $open,
    // $onOpenChange,
    $defaultOpen,
  } = props;
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
    if (!internalOpen) return;
    if (!ref.current) return;

    // set menu width
    setMenuWidth(ref.current.offsetWidth);

    // goto first selected item if exists
    requestAnimationFrame(() => {
      if (!floatingRef.current) return;

      const selection = floatingRef.current.querySelector(
        '[data-selected="true"]',
      );

      selection?.scrollIntoView({
        block: 'center',
        behavior: 'auto',
      });
    });
  }, [internalOpen]);

  const flatOptions = useMemo(() => {
    if ($options.length) return $options;

    return $groups.flatMap((g) => g.options);
  }, [$options, $groups]);

  const singleSelect = useMemo(() => {
    if ($multiple) return undefined;
    return flatOptions.find((o) => o.value === value);
  }, [flatOptions, value, $multiple]);

  const multiSelect = useMemo(() => {
    if (!$multiple) return [];
    return flatOptions.filter((o) => value?.includes(o.value));
  }, [flatOptions, value, $multiple]);

  const filteredOptions = useMemo(() => {
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
    return flatList.map((o, idx) => {
      const bg = idx % 2 ? 'odd' : 'even';
      const isSelected = $multiple
        ? Array.isArray(value) && value.includes(o.value)
        : o.value === value;

      return (
        <li
          className={`option ${bg}`}
          data-disabled={o.disabled || undefined}
          data-selected={isSelected ? 'true' : undefined}
          key={o.value}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            if (!$multiple) {
              props.onChange(o.value);
              setQuery('');
              setInternalOpen(false);
            } else {
              const current = Array.isArray(value) ? value : [];
              const exists = current.includes(o.value);
              const next = exists
                ? current.filter((v) => v !== o.value)
                : [...current, o.value];
              props.onChange(next);
            }
          }}
        >
          {o.label ?? o.value}
        </li>
      );
    });
  };

  const getGroupList = (groupList: OptionGroup[]) => {
    return groupList.map((g, idx) => {
      const bg = idx % 2 ? 'odd' : 'even';
      return (
        <Fragment key={g.label}>
          <li className={`group ${bg}`}>
            <span>{g.label}</span>
          </li>
          {getFlatList(g.options)}
        </Fragment>
      );
    });
  };

  const isReadOnly = !$editable;
  const areGroups = $groups.length > 0;
  const items = areGroups ? filteredGroups : filteredOptions;
  const isEmpty = items.length === 0;
  const hasItems = !isEmpty;
  const hasSelection = $multiple ? multiSelect.length > 0 : !!singleSelect;

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
      {$multiple && multiSelect.length > 0 && (
        <div className='combo-bits'>
          {multiSelect.map((opt) => (
            <span key={opt.value}>
              {opt.label ?? opt.value}

              <button
                type='button'
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const current = Array.isArray(value) ? value : [];
                  const next = current.filter((v) => v !== opt.value);

                  props.onChange(next);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        id={id}
        value={
          internalOpen
            ? query
            : $multiple
              ? ''
              : (singleSelect?.label ?? singleSelect?.value ?? '')
        }
        onFocus={() => setInternalOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setInternalOpen(true);
        }}
        placeholder={hasSelection ? '' : isEmpty ? 'No options' : $placeholder}
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
          {areGroups
            ? getGroupList(filteredGroups)
            : getFlatList(filteredOptions)}
        </ul>
      )}
    </div>
  );
};
