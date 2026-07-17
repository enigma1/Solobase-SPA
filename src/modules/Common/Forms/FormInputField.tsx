import { useState } from 'react';
import { FieldValues, Controller, Path } from 'react-hook-form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { FormFieldWrapper } from './FormCommon';
import type { FormCommonFieldProps, CommonFieldProps } from '>/types';

export type InputFieldProps = CommonFieldProps & {
  inputClassName?: string;
};

// export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
//   label?: string;
//   notice?: string;
//   status?: 'error' | 'success';
//   endAdornment?: React.ReactNode;
//   inputClassName?: string;
//   onValueChange?: (value: string) => void;
// };

export const InputField = <T extends FieldValues, N extends Path<T>>({
  id,
  label,
  $notice,
  $status,
  endAdornment,
  inputClassName,
  value,
  type,
  onChange,
  onValueChange,
  ...props
}: InputFieldProps) => (
  <FormFieldWrapper
    label={label}
    htmlFor={id}
    $notice={$notice}
    $status={$status}
  >
    <div className='field-control'>
      <input
        {...props}
        {...(value !== undefined ? { value } : {})}
        type={type ?? 'text'}
        id={id}
        className={`w-full input ${inputClassName ?? ''}`}
        data-status={status}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.currentTarget.value);
        }}
      />
      {endAdornment}
    </div>
  </FormFieldWrapper>
);

export const FormInputField = <T extends FieldValues, N extends Path<T>>({
  id,
  name,
  control,
  label,
  rules,
  endAdornment,
  onValueChange,
  ...rest
}: FormCommonFieldProps<T, N> & {
  type?: string;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const handleChange = (v: string) => {
          onValueChange?.(v, field);
          field.onChange(v);
        };
        return (
          <InputField
            {...field}
            {...rest}
            id={id}
            label={label}
            onValueChange={handleChange}
            $notice={fieldState.error?.message}
            $status={fieldState.error ? 'error' : undefined}
            endAdornment={endAdornment}
          />
        );
      }}
    />
  );
};

export const FormTextField = <T extends FieldValues, N extends Path<T>>(
  props: Omit<FormCommonFieldProps<T, N>, 'type'>,
) => <FormInputField {...props} type='text' />;

export const FormPasswordField = <T extends FieldValues, N extends Path<T>>(
  props: Omit<FormCommonFieldProps<T, N>, 'type'>,
) => {
  const [visible, setVisible] = useState(false);

  return (
    <FormInputField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type='button'
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className='field-action-btn'
        >
          {visible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
        </button>
      }
    />
  );
};

// For future expansion
export const FormEmailField = <T extends FieldValues, N extends Path<T>>(
  props: Omit<FormCommonFieldProps<T, N>, 'type'>,
) => <FormInputField {...props} type='email' />;
