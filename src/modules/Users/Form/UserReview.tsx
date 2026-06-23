import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { UserShape } from '>/types';

type UserReviewProps = {
  form: UseFormReturn<UserShape>;
  onValidation: (valid: boolean) => void;
};

export const UserReview = ({ form, onValidation }: UserReviewProps) => {
  const { getValues } = form;

  const values = getValues();
  useEffect(() => {
    onValidation(true);
  }, []);

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Review User Details</h1>
      </div>
      <div className='area-content'>Review goes here</div>
    </div>
  );
};
