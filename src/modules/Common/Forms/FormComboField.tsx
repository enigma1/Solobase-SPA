import {
  FieldValues,
  Control,
  RegisterOptions,
  Controller,
  Path,
} from 'react-hook-form';

import { FormFieldWrapper } from './FormCommon';
import { ComboBox } from '>/modules';
import {
  FormCommonFieldProps,
  Option,
  OptionGroup,
  ListScrollInfo,
  FieldAdapter,
  CommonFieldProps,
  WrapLayout,
} from '>/types';

type ComboCommonFields = {
  $options?: Option[];
  $groups?: OptionGroup[];
  $editable?: boolean;
  $multiple?: boolean;
  $placeholder?: string;
  onListScroll?: (info: ListScrollInfo) => void;
  wrapLayout?: WrapLayout;
  wrapClass?: string;
};

type ComboFieldProps = Omit<
  CommonFieldProps,
  'onChange' | 'onValueChange' | 'value' | 'type'
> &
  ComboCommonFields & {
    value: string | string[];
    onChange: (value: string | string[]) => void;
  };
export const ComboField = ({
  label,
  onChange,
  htmlFor,
  $notice,
  $status,
  wrapClass,
  wrapLayout,
  ...props
}: ComboFieldProps) => {
  return (
    <FormFieldWrapper
      label={label}
      $notice={$notice}
      $status={$status}
      htmlFor={htmlFor ?? props.id}
      wrapClass={wrapClass}
      wrapLayout={wrapLayout}
    >
      <ComboBox {...props} onChange={onChange} />
    </FormFieldWrapper>
  );
};

type FormComboFieldProps<
  T extends FieldValues,
  N extends Path<T>,
> = FormCommonFieldProps<T, N> &
  ComboCommonFields & {
    onValueChange?: (value: string | string[], field: FieldAdapter) => void;
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
