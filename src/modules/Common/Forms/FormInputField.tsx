import { InputHTMLAttributes, useState } from 'react';
import { FormFieldWrapper } from './FormCommon';
import {
  FieldValues,
  RegisterOptions,
  Path,
  Control,
  Controller,
} from 'react-hook-form';

type FormInputFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: 'text' | 'password' | 'email';
  rules?: RegisterOptions<T, Path<T>>;
  endAdornment?: React.ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>;

export const FormInputField = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  type = 'text',
  endAdornment,
  ...rest
}: FormInputFieldProps<T> & { type?: string }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          htmlFor={name}
          error={fieldState.error?.message}
        >
          <input
            {...field}
            {...rest}
            type={type}
            // className='w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            className='w-full input'
          />
          {endAdornment && endAdornment}
        </FormFieldWrapper>
      )}
    />
  );
};

export const FormTextField = <T extends FieldValues>(
  props: Omit<FormInputFieldProps<T>, 'type'>,
) => <FormInputField {...props} type='text' />;

export const FormPasswordField = <T extends FieldValues>(
  props: Omit<FormInputFieldProps<T>, 'type'>,
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
          👁
        </button>
      }
    />
  );
};

// For future expansion
export const FormEmailField = <T extends FieldValues>(
  props: Omit<FormInputFieldProps<T>, 'type'>,
) => <FormInputField {...props} type='email' />;
