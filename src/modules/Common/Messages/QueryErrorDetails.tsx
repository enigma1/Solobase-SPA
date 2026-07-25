import { ApiError } from '>/types';
type Props = {
  error: ApiError;
};

export const QueryErrorDetails = ({ error }: Props) => (
  <>
    <h3>{error.error}</h3>
    <p className='text-sm'>{error.message}</p>
    {error.details && (
      <ul>
        {error.details.map((detail, idx) => (
          <li key={`query-error-${idx}`}>{detail}</li>
        ))}
      </ul>
    )}
  </>
);
