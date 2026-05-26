import { useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { dbApi } from '>/services/api/dbApi';
import { accountStoreActions } from '>/services/stores';

export const HeartbeatMonitor = () => {
  useEffect(() => {
    let cancelled = false;
    let failures = 0;

    const check = async () => {
      try {
        await dbApi.ping();

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

    const id = setInterval(check, 10000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
};
