import { useState, useEffect } from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { useAccountStore } from '>/services/stores';

export const SelfCaps = () => {
  const capabilities = useAccountStore(({ state }) => state.capabilities);

  const items = [
    ['Grant Privileges', capabilities.canGrantPrivileges],
    ['View Users', capabilities.canViewUsers],
    ['Manage Users', capabilities.canManageUsers],
    ['Create Databases', capabilities.canCreateDatabases],
    ['Manage Tables', capabilities.canManageTables],
    ['Edit Data', capabilities.canEditData],
  ];

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Current Privileges</h1>
      </div>

      <div className='area-listing'>
        {items.map(([label, enabled], idx) => {
          const bgStyle = idx % 2 ? 'odd' : 'even';
          return (
            <div
              key={label as string}
              className={`area-item flex-row items-center gap-2 ${bgStyle}`}
            >
              <div className='one-line'>
                {enabled ? (
                  <CheckCircle2Icon size={16} className='shrink-0' />
                ) : (
                  <XCircleIcon size={16} className='shrink-0' />
                )}

                <span>{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
