import { FormFieldWrapper } from './FormCommon';
import { FieldValues, Controller } from 'react-hook-form';
import { FormCommonFieldProps } from './commonTypes';

type FormTextAreaFieldProps<T extends FieldValues> = FormCommonFieldProps<T>;
export const FormTextAreaField = <T extends FieldValues>({
  name,
  control,
  label,
}: FormTextAreaFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          $status={fieldState.error ? 'error' : undefined}
          $notice={fieldState.error?.message}
        >
          <textarea {...field} value={field.value ?? ''} />
        </FormFieldWrapper>
      )}
    />
  );
};
