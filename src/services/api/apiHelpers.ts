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
