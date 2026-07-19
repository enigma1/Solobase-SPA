import { FormFieldWrapper } from './FormCommon';
import {
  FieldValues,
  Controller,
  Path,
  Control,
  RegisterOptions,
} from 'react-hook-form';

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    htmlFor?: string;
    label?: string;
    notice?: string;
    status?: 'error' | 'success';
    wrapClass?: string;
  };

export const TextAreaField = ({
  htmlFor,
  label,
  notice,
  status,
  wrapClass,
  ...props
}: TextAreaProps) => {
  return (
    <FormFieldWrapper
      wrapClass={wrapClass}
      label={label}
      $notice={notice}
      $status={status}
      htmlFor={htmlFor ?? props.id}
    >
      <textarea {...props} />
    </FormFieldWrapper>
  );
};

type FormTextAreaFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  rules?: RegisterOptions<T, Path<T>>;
};

export const FormTextAreaField = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
}: FormTextAreaFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextAreaField
          {...field}
          label={label}
          value={field.value ?? ''}
          notice={fieldState.error?.message}
          status={fieldState.error ? 'error' : undefined}
        />
      )}
    />
  );
};
