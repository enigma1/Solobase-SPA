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
export type FormCommonFieldProps<T extends FieldValues> = {
  id?: string;
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: 'text' | 'password' | 'email';
  $status?: StatusType;
  rules?: RegisterOptions<T, Path<T>>;
  endAdornment?: React.ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>;
