import { useEffect } from 'react';
import { useWatch, UseFormReturn, Controller } from 'react-hook-form';
import { SquareActivityIcon } from 'lucide-react';
import { FormTextField, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { UserShape } from '>/types';
import { StorageEngineMeta } from '>/services/api';

type UserBasicsProps = {
  mode: 'create' | 'edit';
  form: UseFormReturn<UserShape>;
  defaults: {
    user: string;
    host: string;
    password: string;
    profile?: string;
  };
  onValidation: (valid: boolean) => void;
};

export const UserBasics = ({ mode, form, defaults }: UserBasicsProps) => {
  return null;
};
