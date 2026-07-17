import { StatusType, WrapLayout } from '>/types';

export type FootNoticeProps = {
  $status?: StatusType;
  $notice?: string | boolean;
};
export const FootNotice = ({ $status, $notice }: FootNoticeProps) => {
  if (!$status || !$notice || typeof $notice != 'string') return null;

  return <div className={`text-sm field-${$status}`}>{$notice}</div>;
};

type FieldWrapperProps = FootNoticeProps & {
  label?: string;
  htmlFor?: string;
  children: React.ReactNode;
  wrapLayout?: WrapLayout;
  wrapClass?: string;
  $status?: string;
  $notice?: string;
};

export const FormFieldWrapper = ({
  label,
  htmlFor,
  children,
  wrapLayout = 'stack',
  wrapClass,
  $status,
  $notice,
}: FieldWrapperProps) => {
  if (wrapLayout === 'inline') {
    return (
      <div className={['field', wrapClass].join(' ')} data-layout={wrapLayout}>
        {label && (
          <label data-status={$status} className='check-label'>
            {children}
            {label}
          </label>
        )}
        <FootNotice $status={$status} $notice={$notice} />
      </div>
    );
  }
  return (
    <div className={['field', wrapClass].join(' ')} data-layout={wrapLayout}>
      {label && (
        <label htmlFor={htmlFor} data-status={$status} className='check-label'>
          {label}
        </label>
      )}
      {children}
      <FootNotice $status={$status} $notice={$notice} />
    </div>
  );
};
