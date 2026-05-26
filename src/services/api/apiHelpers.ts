import { apiErrorResolver } from './apiErrors';

// For axios
export const handleApiAxios = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    const result = await fn();
    return result;
  } catch (e: unknown) {
    await apiErrorResolver(e);
  }
  throw new Error('unknown');
};

// For generic api
export const handleApi = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    const result = await fn();
    return result;
  } catch (e: unknown) {
    let message = 'Unknown error';
    if (e instanceof Error && e.message.length > 0) {
      message = e.message;
    } else if (typeof e === 'string') {
      message = e;
    }
    // Optional: log to console or reporting service
    console.error('API error:', message);
    throw new Error(message);
  }
};
