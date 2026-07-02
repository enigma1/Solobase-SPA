import { useState } from 'react';
import { InputField } from '>/modules';
import { useConfigStore } from '>/services/stores';
import { userPrefs } from '>/services/utils';
import { dbApi } from '>/services/api';
import { ItemPreferenceProps } from '</src/types';

export const NetworkSelect = ({ onModify }: ItemPreferenceProps) => {
  const { backend, setBackend, frontPort, setFrontPort } = useConfigStore(
    ({ state, api }) => ({
      frontPort: state.frontPort,
      setFrontPort: api.setFrontPort,
      backend: state.backend,
      setBackend: api.setBackend,
    }),
  );
  const [connect, setConnect] = useState<string>(backend);

  const logout = async () => {
    if (!connect || connect.length < 4) return;

    const url = new URL(connect);
    url.port = String(userPrefs.frontPort);
    url.pathname = '/';
    url.search = '';
    url.hash = '';
    setBackend(connect, false);
    await dbApi.logout();
    window.location.href = url.toString();
  };

  return (
    <>
      <div className='flex flex-col space-y-1'>
        <InputField
          id='fontend-port'
          label='Frontend Port:'
          value={frontPort}
          onValueChange={(v) => {
            const portNumber = Number(v);
            onModify({ frontPort: portNumber });
            setFrontPort(portNumber);
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

      <div className='flex flex-col space-y-1'>
        <InputField
          id='backend-connect'
          label='Backend:'
          value={connect}
          onValueChange={(value) => {
            onModify({ backend: value });
            setConnect(value);
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              await logout();
            }
          }}
          placeholder='Enter connection'
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
