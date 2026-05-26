import { StatusType } from '>/types';

type FootNoticeProps = {
  $status?: StatusType;
  $notice?: string | boolean;
};
export const FootNotice = ({ $status, $notice }: FootNoticeProps) => {
  if (!$status || !$notice || typeof $notice != 'string') return null;

  return <div className={`field-${$status}`}>{$notice}</div>;
};

type FieldWrapperProps = FootNoticeProps & {
  label?: string;
  htmlFor?: string;
  children: React.ReactNode;
  $status?: string;
  $notice?: string;
};

export const FormFieldWrapper = ({
  label,
  htmlFor,
  children,
  $status,
  $notice,
}: FieldWrapperProps) => {
  return (
    <div className='field'>
      {label && (
        <label htmlFor={htmlFor} data-status={$status}>
          {label}
        </label>
      )}
      {children}
      <FootNotice $status={$status} $notice={$notice} />
    </div>
  );
};
