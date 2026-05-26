import { InputHTMLAttributes, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { FormFieldWrapper } from './FormCommon';
import {
  FieldValues,
  RegisterOptions,
  Path,
  Control,
  Controller,
} from 'react-hook-form';
import { StatusType } from '>/types';

type FormInputFieldProps<T extends FieldValues> = {
  id?: string;
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: 'text' | 'password' | 'email';
  $status?: StatusType;
  rules?: RegisterOptions<T, Path<T>>;
  endAdornment?: React.ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>;

export const FormInputField = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  rules,
  type = 'text',
  $status,
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
          htmlFor={id}
          $notice={fieldState.error?.message}
          $status={fieldState.error?.message ? 'error' : undefined}
        >
          <div className='field-control'>
            <input
              {...field}
              {...rest}
              id={id}
              type={type}
              className='w-full input'
              data-status={!!fieldState.error ? 'error' : undefined}
            />

            {endAdornment && endAdornment}
          </div>
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
          {visible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
        </button>
      }
    />
  );
};

// For future expansion
export const FormEmailField = <T extends FieldValues>(
  props: Omit<FormInputFieldProps<T>, 'type'>,
) => <FormInputField {...props} type='email' />;
