import { Path, FieldValues, Controller } from 'react-hook-form';
import { JsonEditor } from '>/modules';
import { FormCommonFieldProps } from '>/types';
import { FormFieldWrapper } from './FormCommon';

type FormJsonFieldProps<
  T extends FieldValues,
  N extends Path<T>,
> = FormCommonFieldProps<T, N>;
export const FormJsonField = <T extends FieldValues, N extends Path<T>>({
  name,
  control,
  label,
}: FormJsonFieldProps<T, N>) => {
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
