import { FieldValues, Path, Controller } from 'react-hook-form';
import { FormCommonFieldProps } from '>/types';
import { InputFieldProps, InputField } from './FormInputField';

export type NumberFieldProps = Omit<
  InputFieldProps,
  'type' | 'onValueChange'
> & {
  onValueChange?: (value: number | undefined) => void;
};

export const NumberField = ({ onValueChange, ...props }: NumberFieldProps) => (
  <InputField
    {...props}
    type='number'
    onValueChange={(value) => {
      const numeric = value === '' ? undefined : Number(value);
      onValueChange?.(numeric);
    }}
  />
);

export const FormNumberField = <T extends FieldValues, N extends Path<T>>(
  props: FormCommonFieldProps<T, N>,
) => (
  <Controller
    name={props.name}
    control={props.control}
    rules={props.rules}
    render={({ field, fieldState }) => (
      <NumberField
        {...props}
        {...field}
        value={field.value ?? ''}
        onValueChange={(value) => field.onChange(value)}
        $notice={fieldState.error?.message}
        $status={fieldState.error ? 'error' : undefined}
      />
    )}
  />
);
