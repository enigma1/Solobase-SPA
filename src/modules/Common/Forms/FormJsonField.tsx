import ReactJsonView from '@microlink/react-json-view';
import { FormFieldWrapper } from './FormCommon';
import { FieldValues, Controller } from 'react-hook-form';
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
          <ReactJsonView
            src={field.value ?? {}}
            onEdit={(e) => field.onChange(e.updated_src)}
            onAdd={(e) => field.onChange(e.updated_src)}
            onDelete={(e) => field.onChange(e.updated_src)}
          />
        </FormFieldWrapper>
      )}
    />
  );
};
