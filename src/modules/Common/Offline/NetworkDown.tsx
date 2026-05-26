import { intervalToDuration } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from '>/config/routes';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { useEffect, useState } from 'react';

const formatDuration = (d: Temporal.Duration) => {
  const total = Math.floor(d.total({ unit: 'seconds' }));

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const NetworkDown = () => {
  const [startedAt] = useState(() => Temporal.Now.instant());
  const [_, setToggle] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const online = useAccountStore(({ state }) => state.online);
  const redirectPath = location.state?.from ?? routes.front.login;

  useEffect(() => {
    const id = setInterval(() => {
      setToggle((t) => !t); // force re-render every sec
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!online) {
      return;
    }

    messageStoreActions.addMessage({
      type: 'success',
      content: {
        text: `Network connectivity restored after ${formatDuration(Temporal.Now.instant().since(startedAt))}`,
        duration: 5000,
      },
    });

    navigate(redirectPath, {
      replace: true,
    });
  }, [online, redirectPath]);

  const duration = Temporal.Now.instant().since(startedAt);
  const durationFormatted = formatDuration(duration);
  return (
    <div className='page-container items-center justify-center h-screen'>
      <div className='page-toolbar'>
        <h1 className='page-title text-4xl font-bold'>Network Down</h1>
      </div>

      <p className='text-lg my-4 mx-auto text-center max-w-md'>
        It seems like you're offline. System will automatically reconnect once
        connectivity is restored.
      </p>
      <p className='text-2xl font-mono'>{durationFormatted}</p>
    </div>
  );
};
