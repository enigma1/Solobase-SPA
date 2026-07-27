import { z } from 'zod';
import { dialogStoreActions } from '>/services/stores';
import { LocalError, LocalErrorTypes } from '>/types';

export const createResourceLoadError = (
  msg: string,
  type: LocalErrorTypes,
): LocalError => ({
  error: type,
  name: 'ERR_RESOURCE_LOAD',
  message: msg,
});

const resourceErrorSchema = z.object({
  resource: z.string(),
});

const localErrorSchemas = [
  {
    type: 'resource',
    schema: resourceErrorSchema,
    resolver: createResourceLoadError,
  },
];

export const customErrorResolver = async (e: unknown) => {
  const isActive = dialogStoreActions.getActive();
  for (const item of localErrorSchemas) {
    const result = item.schema.safeParse(e);

    if (result.success) {
      const error = item.resolver(e as string, 'resource');
      dialogStoreActions.setError(error);
      // throw item.resolver(e as string, 'resource');
      break;
    }
  }

  throw new Error(String(e));
};

export const handleLocalRequests = async <T>(
  fn: () => Promise<T>,
): Promise<T | undefined> => {
  try {
    const result = await fn();
    return result;
  } catch (e: unknown) {
    await customErrorResolver(e);
  }
};
