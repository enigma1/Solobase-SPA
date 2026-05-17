import { InputHTMLAttributes, useEffect, useRef } from 'react';
import { FieldValues, Path, Control, Controller } from 'react-hook-form';

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'onChange'
> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
};

export const Checkbox = ({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  id,
  title,
  className,
}: CheckboxProps) => {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      id={id}
      title={title}
      className={className ?? 'check'}
    />
  );
};

type FormCheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  id?: string;
};

export const FormCheckboxField = <T extends FieldValues>({
  name,
  control,
  label,
  id,
}: FormCheckboxFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const checkbox = (
          <Checkbox
            checked={!!field.value}
            onChange={field.onChange}
            id={id ?? name}
          />
        );
        // const checkbox = (
        //   <input
        //     id={id ?? name}
        //     type='checkbox'
        //     checked={!!field.value}
        //     onChange={(e) => field.onChange(e.target.checked)}
        //     className='check'
        //     title={name}
        //   />
        // );

        if (!label) return checkbox;

        return (
          <label className='check-label' htmlFor={id ?? name}>
            {checkbox}
            {label}
          </label>
        );
      }}
    />
  );
};
