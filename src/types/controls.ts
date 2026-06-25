import { InputHTMLAttributes } from 'react';
import {
  FieldValues,
  RegisterOptions,
  Path,
  Control,
  ControllerRenderProps,
} from 'react-hook-form';
import { StatusType } from '>/types';

export type AnyControlField = ControllerRenderProps<any, any>;
export type FormCommonFieldProps<T extends FieldValues, N extends Path<T>> = {
  id?: string;
  name: N;
  control: Control<T>;
  label: string;
  type?: 'text' | 'password' | 'email';
  $status?: StatusType;
  rules?: RegisterOptions<T, N>;
  endAdornment?: React.ReactNode;
  onValueChange?: (value: string, field: any) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>;

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
