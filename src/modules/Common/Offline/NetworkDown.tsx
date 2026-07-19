import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { intervalToDuration } from 'date-fns';
import {
  messageStoreActions,
  useAccountStore,
  configStoreActions,
} from '>/services/stores';
import { NumberField } from '>/modules';
import { routes } from '>/config/routes';

const formatDuration = (d: Temporal.Duration) => {
  const total = Math.floor(d.total({ unit: 'seconds' }));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const NetworkDown = () => {
  const [endpoint, setEndpoint] = useState<number | undefined>(
    configStoreActions.getBackport(),
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

    const duration = Temporal.Now.instant().since(startedAt);
    if (duration.total({ unit: 'seconds' }) >= 3) {
      messageStoreActions.addMessage({
        type: 'success',
        content: {
          text: `Network connectivity restored after ${formatDuration(Temporal.Now.instant().since(startedAt))}`,
          duration: 8000,
        },
      });
    }

    navigate(redirectPath, {
      replace: true,
    });
  }, [online, redirectPath]);

  const setConnection = () => {
    configStoreActions.setBackport(endpoint);

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
              It seems like you're offline or the system is misconfigured and
              cannot connect to a back endpoint. System will automatically
              reconnect once connectivity is restored.
            </p>
            <p className='central'>
              Enter a connection port endpoint below for your Solobase Agent
              local proxy or directly to the Solobase Host Server if the SPA is
              deployed on the same endpoint as the Server.
              <br />
              For example: 5650
            </p>
            <div className='flex flex-col my-3 space-y-1'>
              <NumberField
                id='query-title'
                label='Set Connection Endpoint Port:'
                value={endpoint}
                onValueChange={(value) => {
                  setEndpoint(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setConnection();
                  }
                }}
                placeholder='eg: 5650'
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
