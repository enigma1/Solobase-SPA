import { InputHTMLAttributes, useEffect, useRef } from 'react';
import { FieldValues, Path, Control, Controller } from 'react-hook-form';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { FormFieldWrapper } from './FormCommon';

type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'onChange'
> & {
  label?: string;
  notice?: string;
  status?: 'error' | 'success';
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  wrapLayout?: 'inline' | 'stack';
};

export const CheckboxField = ({
  id,
  label,
  title,
  notice,
  status,
  checked,
  onChange,
  wrapLayout = 'inline',
  indeterminate = false,
  disabled = false,
}: CheckboxFieldProps) => {
  const ref = useRef<HTMLInputElement | null>(null);
  if ((id && !label) || (!id && label)) {
    console.warn('CheckboxField: Wrong use having id without label');
  }
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <FormFieldWrapper
      label={label ?? id}
      wrapLayout={wrapLayout}
      $notice={notice}
      $status={status}
    >
      <input
        ref={ref}
        id={id}
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        title={title}
        className='sr-only'
      />

      <span
        className='box'
        onClick={() => {
          if (!id && !label) ref.current?.click();
        }}
      >
        {checked && <CheckIcon size={14} />}
        {!checked && indeterminate && <MinusIcon size={14} />}
      </span>
    </FormFieldWrapper>
  );
};

type FormCheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  id?: string;
  onValueChange?: (checked: boolean, field: any) => void;
  wrapLayout?: 'inline' | 'stack';
};

export const FormCheckboxField = <T extends FieldValues>({
  name,
  control,
  label,
  id,
  onValueChange,
  wrapLayout,
}: FormCheckboxFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const handleChange = (checked: boolean) => {
          onValueChange?.(checked, field);
          field.onChange(checked);
        };

        return (
          <CheckboxField
            checked={!!field.value}
            onChange={handleChange}
            id={id ?? name}
            label={label}
            wrapLayout={wrapLayout}
          />
        );
      }}
    />
  );
};
