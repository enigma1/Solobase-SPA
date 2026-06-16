import { useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { dbApi } from '>/services/api/dbApi';
import { accountStoreActions, messageStoreActions } from '>/services/stores';

export const AliveMonitor = () => {
  useEffect(() => {
    let cancelled = false;
    let failures = 0;

    const check = async () => {
      try {
        const rsp = await dbApi.checkSession();
        const isAuthenticated = accountStoreActions.getAuthenticated();
        if (rsp.ok === false && isAuthenticated) {
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
      } catch {
        failures++;

        if (failures >= 3) {
          accountStoreActions.setAppStatus(false);
          onlineManager.setOnline(false);
        }
      }
    };

    check();

    const id = setInterval(check, 30000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
};
