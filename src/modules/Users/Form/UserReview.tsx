import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserFormShape, UserFormMode, profileOptions } from './userProfiles';

type UserReviewProps = {
  mode: UserFormMode;
  form: UseFormReturn<UserFormShape>;
  onValidation: (valid: boolean) => void;
};

export const UserReview = ({ mode, form, onValidation }: UserReviewProps) => {
  const { getValues } = form;

  const values = getValues();
  useEffect(() => {
    onValidation(true);
  }, []);

  const selectedProfile = values.profile
    ? profileOptions[values.profile]
    : undefined;

  const reviewItems = [
    {
      label: 'User name',
      value: values.user,
    },
    {
      label: 'Host',
      value: values.host,
    },
    {
      label: 'Profile',
      value: selectedProfile?.description,
    },
  ];

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>
          User Details to set are shown in the table below
        </h1>
      </div>
      <div className='area-listing flex-none'>
        <table className='table w-fit'>
          <tbody>
            {reviewItems.map((row, idx) => {
              const rowBg = idx % 2 === 0 ? 'even' : 'odd';

              return (
                <tr key={`review-tr-${idx}`} className={rowBg}>
                  <td>{row.label}</td>
                  <td>{row.value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className='area-content'>
        <p>
          If you want to maintain existing privileges for existing users{' '}
          <strong>select profile existing</strong>
        </p>
      </div>
    </div>
  );
};
