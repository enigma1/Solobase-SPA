import { useState } from 'react';
import { InputField, NumberField } from '>/modules';
import { useConfigStore } from '>/services/stores';
import { userPrefs } from '>/services/utils';
import { dbApi } from '>/services/api';
import { backPath } from '>/services/utils';
import { ItemPreferenceProps } from '>/types';

export const NetworkSelect = ({ onModify }: ItemPreferenceProps) => {
  const { backPort, setBackport, frontPort, setFrontPort } = useConfigStore(
    ({ state, api }) => ({
      frontPort: state.frontPort,
      setFrontPort: api.setFrontPort,
      backPort: state.backPort,
      setBackport: api.setBackport,
    }),
  );
  const [backendPort, setBackendPort] = useState<number | undefined>(backPort);

  const logout = async () => {
    if (!backendPort) return;
    const connect = `${backPath}:${backendPort}`;
    const url = new URL(connect);
    url.port = String(userPrefs.frontPort);
    url.pathname = '/';
    url.search = '';
    url.hash = '';
    setBackport(backendPort, false);
    await dbApi.logout();
    window.location.href = url.toString();
  };

  return (
    <>
      <div className='wrapper space-y-1'>
        <NumberField
          id='fontend-port'
          label='Frontend Port:'
          value={frontPort}
          onValueChange={(value) => {
            onModify({ frontPort: value });
            setFrontPort(value);
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              await logout();
            }
          }}
          placeholder='Front End port eg: 5173'
        />
      </div>

      <div className='wrapper space-y-1'>
        <NumberField
          id='backend-connect'
          label='Backend Port:'
          value={backendPort}
          onValueChange={(value) => {
            onModify({ backPort: value });
            setBackendPort(value);
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              await logout();
            }
          }}
          placeholder='Enter connection path'
        />
        <button
          className='btn'
          onClick={async () => {
            await logout();
          }}
        >
          Reconnect
        </button>
      </div>
    </>
  );
};
