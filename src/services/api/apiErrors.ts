import axios, { AxiosError } from 'axios';
import { queryClient } from '>/config/reactQuery';
import { messageStoreActions, accountStoreActions } from '>/services/stores';
import { hasObjectProps, hasStringPropValue } from '>/services/utils';
import { ApiError } from '>/types';

export const isNetworkError = (error: unknown): boolean =>
  hasStringPropValue(error, 'type', 'network');

export const createNetworkError = (reason: string) => ({
  code: 'ERR_OFFLINE',
  error: 'Network is down',
  message: reason,
});

export const createCancelError = (reason: string) => ({
  code: 'ERR_CANCELED',
  error: 'Request Cancelled',
  message: reason,
});

export const createAuthError = (reason: string) => ({
  code: 'ERR_UNAUTHORIZED',
  error: 'Unauthorized',
  message: reason,
});

export const createUnknownError = (response: Record<string, unknown>) => ({
  code: response?.code ?? 'ERR_UNKNOWN',

  error: response?.error ?? 'Unknown Error',
  message: response?.message ?? 'Unknown response received from server',
});

const authError = async () => {
  await queryClient.cancelQueries();
  throw createAuthError('Login required to access this');
};

export const apiErrorResolver = async (e: unknown) => {
  if (axios.isAxiosError(e) && e.code === axios.AxiosError.ERR_CANCELED) {
    const cancelError = createCancelError(
      e.message ?? 'unknown cancellation reason',
    );
    throw cancelError;
  }
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
    console.log('axios-error', e.response);
    const axiosError = e as any;

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (status === 401) {
      await authError();
    }
    throw createUnknownError({ ...data, code: status });
  }
  if (e instanceof Error) {
    throw e;
  }
  throw new Error(String(e));
};
