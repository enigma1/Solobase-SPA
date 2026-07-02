import { useState } from 'react';
import { FieldValues, Controller } from 'react-hook-form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { FormFieldWrapper } from './FormCommon';
import type { FormCommonFieldProps } from './commonTypes';

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  notice?: string;
  status?: 'error' | 'success';
  endAdornment?: React.ReactNode;
  inputClassName?: string;
  onValueChange?: (value: string) => void;
};

export const InputField = ({
  id,
  label,
  notice,
  status,
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
    $notice={notice}
    $status={status}
  >
    <div className='field-control'>
      <input
        {...props}
        value={value ?? ''}
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

export const FormInputField = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  rules,
  $status,
  endAdornment,
  onValueChange,
  ...rest
}: FormCommonFieldProps<T> & { type?: string }) => {
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
            notice={fieldState.error?.message}
            status={fieldState.error ? 'error' : undefined}
            endAdornment={endAdornment}
          />
        );
      }}
    />
  );
};

export const FormTextField = <T extends FieldValues>(
  props: Omit<FormCommonFieldProps<T>, 'type'>,
) => <FormInputField {...props} type='text' />;

export const FormPasswordField = <T extends FieldValues>(
  props: Omit<FormCommonFieldProps<T>, 'type'>,
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
export const FormEmailField = <T extends FieldValues>(
  props: Omit<FormCommonFieldProps<T>, 'type'>,
) => <FormInputField {...props} type='email' />;
