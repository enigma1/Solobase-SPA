import { ChangeEvent } from 'react';
import { FormFieldWrapper } from './FormCommon';
import { FieldValues, Controller, Path } from 'react-hook-form';
import { ComboBox } from '>/modules';
import { FormCommonFieldProps, Option, OptionGroup, StatusType } from '>/types';

type ComboCommonFields = {
  $options?: Option[];
  $groups?: OptionGroup[];
  $editable?: boolean;
  $multiple?: boolean;
  $placeholder?: string;
};

type ComboFieldProps = ComboCommonFields & {
  label?: string;
  notice?: string;
  status?: StatusType;
  id?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  htmlFor?: string;
};
export const ComboField = ({
  label,
  notice,
  status,
  onChange,
  htmlFor,
  ...props
}: ComboFieldProps) => {
  return (
    <FormFieldWrapper
      label={label}
      $notice={notice}
      $status={status}
      htmlFor={htmlFor ?? props.id}
    >
      <ComboBox {...props} onChange={onChange} />
    </FormFieldWrapper>
  );
};

type FormComboFieldProps<T extends FieldValues, N extends Path<T>> = Omit<
  FormCommonFieldProps<T, N>,
  'onValueChange'
> &
  ComboCommonFields & {
    onValueChange?: (value: string | string[], field: any) => void;
  };
export const FormComboField = <T extends FieldValues, N extends Path<T>>({
  name,
  control,
  rules,
  onValueChange,
  ...rest
}: FormComboFieldProps<T, N>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const handleChange = (value: string | string[]) => {
          onValueChange?.(value, field);
          field.onChange(value);
        };
        return (
          <ComboField {...rest} value={field.value} onChange={handleChange} />
        );
      }}
    />
  );
};
