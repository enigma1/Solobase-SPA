import axios, { AxiosError } from 'axios';
import { queryClient } from '>/config/reactQuery';
import { messageStoreActions, accountStoreActions } from '>/services/stores';
import { hasObjectProps, hasStringPropValue } from '>/services/utils';

export const isNetworkError = (error: unknown): boolean =>
  hasStringPropValue(error, 'type', 'network');

export const createNetworkError = (reason: string) => ({
  name: 'NetworkError',
  type: 'network' as const,
  reason,
});

const authError = async () => {
  await queryClient.cancelQueries();
  // messageStoreActions.addMessage({
  //   content: {
  //     text: 'Currently you are not authorized to access this resource. Please login again.',
  //     duration: 3000,
  //   },
  // });
  accountStoreActions.initialize(); // triggers redirect
  throw new Error('Unauthorized');
};

const unknownResponseError = (response: any) => {
  throw new Error(
    response?.data?.message ??
      response.message ??
      'Unknown response received from server',
  );
};

export const apiErrorResolver = async (e: unknown) => {
  if (
    axios.isAxiosError(e) &&
    (e.code === axios.AxiosError.ERR_NETWORK ||
      e.code === axios.AxiosError.ECONNABORTED ||
      e.code === axios.AxiosError.ETIMEDOUT)
  ) {
    const networkError = createNetworkError(e.message);
    throw networkError;
  }

  if (hasObjectProps(e, ['response'])) {
    const response = e.response as any;
    response?.status === 401 && (await authError());
    unknownResponseError(response);
  }
  if (e instanceof Error) {
    throw e;
  }
  throw new Error(String(e));
};
