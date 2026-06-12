import { InputHTMLAttributes } from 'react';
import {
  FieldValues,
  RegisterOptions,
  Path,
  Control,
  Controller,
} from 'react-hook-form';

type FormNumberFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  rules?: RegisterOptions<T, Path<T>>;
  min?: number;
  max?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name'>;

export const FormNumberField = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  min,
  max,
  onChange,
  ...rest
}: FormNumberFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <div
            className='flex justify-between items-center'
            title={fieldState.error?.message}
          >
            <label
              htmlFor={name}
              className={`text-sm font-semibold ${fieldState.error ? 'text-red-600' : 'text-gray-800'}`}
            >
              {label}
            </label>
            {fieldState.error && (
              <span className='text-sm text-red-600' aria-hidden>
                {/* You can use an icon here, or just a simple text indicator */}
                !
              </span>
            )}
          </div>

          <input
            {...field}
            {...rest}
            type='number'
            min={min}
            max={max}
            className='w-full input'
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = value === '' ? undefined : Number(value);
              field.onChange(numericValue);
              onChange?.(e);
            }}
          />
        </>
      )}
    />
  );
};
