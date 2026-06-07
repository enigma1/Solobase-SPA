import { useEffect } from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormTextField, ComboBox } from '>/modules';
import { TableShape } from '>/types';

type TableColumnsFormProps = {
  form: UseFormReturn<TableShape>;
  onValidation: (valid: boolean) => void;
};

export const TableReview = ({ form, onValidation }: TableColumnsFormProps) => {
  useEffect(() => {
    onValidation(true);
  }, []);

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Review Table Parameters</h1>
      </div>
      <div className='area-content'>Review the table parameters entered.</div>
    </div>
  );
};
