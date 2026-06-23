import { ChangeEvent } from 'react';
import { FormFieldWrapper } from './FormCommon';
import { FieldValues, Controller } from 'react-hook-form';
import { ComboBox } from '>/modules';
import { FormCommonFieldProps, Option, OptionGroup, StatusType } from '>/types';

type ComboFieldProps = {
  label?: string;
  notice?: string;
  status?: StatusType;
  id?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  htmlFor?: string;
  $options?: Option[];
  $groups?: OptionGroup[];
  $editable?: boolean;
  $multiple?: boolean;
  $placeholder?: string;
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

type FormComboFieldProps<T extends FieldValues> = Omit<
  FormCommonFieldProps<T>,
  'onValueChange'
> & {
  onValueChange?: (value: string | string[], field: any) => void;
};
export const FormComboField = <T extends FieldValues>({
  name,
  control,
  rules,
  onValueChange,
  ...rest
}: FormComboFieldProps<T>) => {
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
