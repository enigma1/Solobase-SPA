import axios, { AxiosError } from 'axios';
import { queryClient } from '>/config/reactQuery';
import { messageStoreActions, accountActions } from '>/services/stores';
import { hasObjectProps } from '>/services/utils';

const NO_RESPONSE_TIMEOUT = 360;
let firstFailureAt: Temporal.Instant | null = null;
export const clearTimoutError = () => {
  firstFailureAt = null;
};

const timeoutError = async () => {
  const currentTs = Temporal.Now.instant();
  if (!firstFailureAt) {
    firstFailureAt = currentTs;
  } else {
    const elapsed = currentTs.since(firstFailureAt);
    if (elapsed.total({ unit: 'seconds' }) >= NO_RESPONSE_TIMEOUT) {
      await queryClient.cancelQueries();
      messageStoreActions.addMessage({
        id: crypto.randomUUID(),
        type: 'error',
        mode: 'header',
        content: {
          text: 'Timeout occured to access this resource. Please login again.',
          duration: 5000,
        },
      });
      accountActions.initialize(); // triggers redirect
      firstFailureAt = null;
    }
  }
  throw new Error('No response from the server');
};

const authError = async () => {
  await queryClient.cancelQueries();
  // messageStoreActions.addMessage({
  //   id: crypto.randomUUID(),
  //   type: 'error',
  //   mode: 'header',
  //   content: {
  //     text: 'Currently you are not authorized to access this resource. Please login again.',
  //     duration: 3000,
  //   },
  // });
  accountActions.initialize(); // triggers redirect
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
    await timeoutError();
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
