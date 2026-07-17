import { ReactNode } from 'react';
import { FormFieldWrapper } from './FormCommon';
import {
  Path,
  FieldValues,
  Controller,
  ControllerFieldState,
} from 'react-hook-form';
import { FormCommonFieldProps, AnyControlField, DataEditorType } from '>/types';

type FormCellFieldProps<
  T extends FieldValues,
  N extends Path<T>,
> = FormCommonFieldProps<T, N> & {
  onSelect?: () => void;
  editorType: DataEditorType;
  renderEditor: (props: {
    id?: string;
    editorType: DataEditorType;
    field: AnyControlField;
    fieldState: ControllerFieldState;
  }) => ReactNode;
};

export const FormCellField = <T extends FieldValues, N extends Path<T>>({
  name,
  control,
  label,
  rules,
  renderEditor,
  onSelect,
  editorType,
  ...props
}: FormCellFieldProps<T, N>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          htmlFor={props.htmlFor ?? props.id}
          $notice={fieldState.error?.message}
          $status={fieldState.error ? 'error' : undefined}
        >
          <div onFocus={onSelect} className='field-control'>
            {renderEditor({
              id: props.id,
              editorType,
              field,
              fieldState,
            })}
          </div>
        </FormFieldWrapper>
      )}
    />
  );
};
