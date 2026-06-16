import { ReactNode } from 'react';
import ReactJsonView from '@microlink/react-json-view';
import { FormFieldWrapper } from './FormCommon';
import {
  FieldValues,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
} from 'react-hook-form';
import { FormCommonFieldProps, AnyControlField } from './commonTypes';

type FormCellFieldProps<T extends FieldValues> = FormCommonFieldProps<T> & {
  onSelect?: () => void;
  renderEditor: (props: {
    field: AnyControlField;
    fieldState: ControllerFieldState;
  }) => ReactNode;
};

export const FormCellField = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  renderEditor,
  onSelect,
}: FormCellFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          $notice={fieldState.error?.message}
          $status={fieldState.error ? 'error' : undefined}
        >
          <div onFocus={onSelect} className='field-control'>
            {renderEditor({ field, fieldState })}
          </div>
        </FormFieldWrapper>
      )}
    />
  );
};
