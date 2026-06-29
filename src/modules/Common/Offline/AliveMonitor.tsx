import { useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { dbApi } from '>/services/api/dbApi';
import { accountStoreActions, messageStoreActions } from '>/services/stores';

export const AliveMonitor = () => {
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let failures = 0;

    const check = async () => {
      let nextDelay = 5000;

      try {
        const rsp = await dbApi.checkSession();
        const isAuthenticated = accountStoreActions.getAuthenticated();

        if (!rsp.ok && isAuthenticated) {
          accountStoreActions.setAuthenticated(false);
          messageStoreActions.addMessage({
            content: {
              text: 'Invalid Session Detected - Please login again',
              duration: 3000,
            },
          });
        }

        if (cancelled) return;

        failures = 0;

        if (!accountStoreActions.getAppStatus()) {
          accountStoreActions.setAppStatus(true);
          onlineManager.setOnline(true);
        }
        nextDelay = 20000;
      } catch {
        failures++;

        if (failures >= 3) {
          accountStoreActions.setAppStatus(false);
          onlineManager.setOnline(false);
          nextDelay = 5000;
        }
      }

      if (!cancelled) {
        timeoutId = setTimeout(check, nextDelay);
      }
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);
  return null;
};
