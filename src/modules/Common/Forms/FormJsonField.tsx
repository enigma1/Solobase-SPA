import { FormFieldWrapper } from './FormCommon';
import { FieldValues, Controller } from 'react-hook-form';
import { JsonEditor } from '>/modules';
import { FormCommonFieldProps } from './commonTypes';

type FormJsonFieldProps<T extends FieldValues> = FormCommonFieldProps<T>;
export const FormJsonField = <T extends FieldValues>({
  name,
  control,
  label,
}: FormJsonFieldProps<T>) => {
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
          <JsonEditor value={field.value} onChange={(v) => field.onChange(v)} />
        </FormFieldWrapper>
      )}
    />
  );
};
