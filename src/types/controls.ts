import { InputHTMLAttributes } from 'react';
import {
  FieldValues,
  RegisterOptions,
  Path,
  Control,
  ControllerRenderProps,
} from 'react-hook-form';
import { StatusType } from '>/types';

export type WrapLayout = 'stack' | 'inline';

export type AnyControlField = ControllerRenderProps<any, any>;

export type CommonFieldProps = {
  id?: string;
  htmlFor?: string;
  label?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  $status?: StatusType;
  $notice?: string;
  endAdornment?: React.ReactNode;
  onValueChange?: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'>;

export type FieldAdapter = {
  onChange: (value: string) => void;
  value: unknown;
  name: string;
};

export type FormCommonFieldProps<
  T extends FieldValues,
  N extends Path<T>,
> = Omit<CommonFieldProps, 'onValueChange' | 'defaultValue'> & {
  name: N;
  control: Control<T>;
  rules?: RegisterOptions<T, N>;
  onValueChange?: (value: string, field: FieldAdapter) => void;
};

export type Option = {
  value: string;
  label?: string;
  disabled?: boolean;
  $editable?: boolean;
};

export type OptionGroup = {
  label: string;
  options: Option[];
};

export type ListScrollInfo = {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
};
