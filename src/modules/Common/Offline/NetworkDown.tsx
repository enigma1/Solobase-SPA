import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { intervalToDuration } from 'date-fns';
import {
  messageStoreActions,
  useAccountStore,
  configStoreActions,
} from '>/services/stores';
import { InputField } from '>/modules';
import { routes } from '>/config/routes';

const formatDuration = (d: Temporal.Duration) => {
  const total = Math.floor(d.total({ unit: 'seconds' }));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const NetworkDown = () => {
  const [endpoint, setEndpoint] = useState<string>(
    configStoreActions.getBackend(),
  );

  const [startedAt] = useState(() => Temporal.Now.instant());
  const [_, setToggle] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const online = useAccountStore(({ state }) => state.online);
  const redirectPath =
    location.state?.from && location.state.from !== routes.front.networkDown
      ? location.state.from
      : routes.front.home;

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
        duration: 8000,
      },
    });

    navigate(redirectPath, {
      replace: true,
    });
  }, [online, redirectPath]);

  const setConnection = () => {
    configStoreActions.setBackend(endpoint);

    messageStoreActions.addMessage({
      type: 'warn',
      content: {
        text: `Connection Endpoint set to ${endpoint}`,
        duration: 5000,
      },
    });
  };

  const duration = Temporal.Now.instant().since(startedAt);
  const durationFormatted = formatDuration(duration);
  return (
    <>
      <div className='page-container items-center justify-center h-screen'>
        <div className='page-content justify-center items-center'>
          <h1 className='page-title text-4xl font-bold'>Network Down</h1>
          <div className='page-section bg-transparent max-w-lg'>
            <p className='central'>
              It seems like you're offline or the system is misconfigured to
              connect to the back-end. System will automatically reconnect once
              connectivity is restored.
            </p>
            <p className='central'>
              Enter a connection endpoint below for the Solobase Agent Proxy or
              to a direct Host/IP.
              <br />
              For example: https://example.com:5650
            </p>
            <div className='flex flex-col my-3 space-y-1'>
              <InputField
                id='query-title'
                label='Set Connection Endpoint:'
                value={endpoint}
                title='When is named it will save the query'
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEndpoint(value);
                }}
                placeholder='eg: https://example.com:5650'
              />
              <button
                className='btn'
                onClick={() => {
                  setConnection();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
          <p className='flex justify-center text-3xl font-mono'>
            {durationFormatted}
          </p>
        </div>
      </div>
    </>
  );
};
