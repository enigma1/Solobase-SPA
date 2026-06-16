import { ChangeEvent, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { FormFieldWrapper } from './FormCommon';
import { FieldValues, Controller } from 'react-hook-form';
import { FormCommonFieldProps } from './commonTypes';

export const FormInputField = <T extends FieldValues>({
  id,
  name,
  control,
  label,
  rules,
  type = 'text',
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
        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const v = e.currentTarget.value;
          onValueChange?.(v, field);
          field.onChange(v);
        };
        return (
          <FormFieldWrapper
            label={label}
            htmlFor={id}
            $notice={fieldState.error?.message}
            $status={fieldState.error?.message ? 'error' : undefined}
          >
            <div className='field-control'>
              <input
                {...field}
                value={field.value ?? ''}
                onChange={handleChange}
                {...rest}
                id={id}
                type={type}
                className='w-full input'
                data-status={!!fieldState.error ? 'error' : undefined}
              />

              {endAdornment && endAdornment}
            </div>
          </FormFieldWrapper>
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
