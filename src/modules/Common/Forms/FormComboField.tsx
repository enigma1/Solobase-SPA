import { FieldValues, Controller, Path } from 'react-hook-form';
import { FormFieldWrapper } from './FormCommon';
import { ComboBox } from '>/modules';
import {
  FormCommonFieldProps,
  Option,
  OptionGroup,
  StatusType,
  ListScrollInfo,
} from '>/types';

type ComboCommonFields = {
  $options?: Option[];
  $groups?: OptionGroup[];
  $editable?: boolean;
  $multiple?: boolean;
  $placeholder?: string;
  onListScroll?: (info: ListScrollInfo) => void;
};

type ComboFieldProps = ComboCommonFields & {
  id?: string;
  label?: string;
  notice?: string;
  status?: StatusType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  htmlFor?: string;
  wrapLayout?: 'stack' | 'inline';
  wrapClass?: string;
};
export const ComboField = ({
  label,
  notice,
  status,
  onChange,
  htmlFor,
  wrapClass,
  wrapLayout,
  ...props
}: ComboFieldProps) => {
  return (
    <FormFieldWrapper
      label={label}
      $notice={notice}
      $status={status}
      htmlFor={htmlFor ?? props.id}
      wrapClass={wrapClass}
      wrapLayout={wrapLayout}
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
