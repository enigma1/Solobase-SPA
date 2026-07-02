import { useState, useEffect } from 'react';
import { ListChevronsDownUpIcon, ListChevronsUpDownIcon } from 'lucide-react';
import { useModal } from '>/services/hooks';
import {
  useConfigStore,
  messageStoreActions,
  configStoreActions,
} from '>/services/stores';
import {
  ThemeSelect,
  HiddenColumns,
  HeaderVisibility,
  SidebarVisibility,
  NetworkSelect,
} from './Prefs';
import { CommonDialogHandlers, StorageConfig } from '>/types';

type PreferencesProps = {
  formHandlers: CommonDialogHandlers;
};
export const Preferences = ({ formHandlers }: PreferencesProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  // const { savePreferences, preferences } = useConfigStore(({ state, api }) => ({
  //   savePreferences: api.savePreferences,
  //   preferences: state,
  // }));

  const [tempSettings, setTempSettings] = useState<StorageConfig>(
    configStoreActions.getPreferences(),
  );
  const { setButtonStatus } = useModal();

  const onConfirm = () => {
    messageStoreActions.addMessage({
      type: 'success',
      content: {
        text: `Preferences updated`,
        duration: 3000,
      },
    });
    configStoreActions.savePreferences(tempSettings);
  };

  const handleModify = (props: Partial<StorageConfig>) => {
    setTempSettings({
      ...tempSettings,
      ...props,
    });
  };

  useEffect(() => {
    setButtonStatus('confirm', tempSettings ? undefined : 'disabled');
  }, [tempSettings]);

  useEffect(() => {
    formHandlers.confirm = onConfirm;
  }, [formHandlers, onConfirm]);

  return (
    <>
      <div className='area-container'>
        <div className='area-spacer'>
          <h1 className='area-title'>Preferences</h1>
          <div className='area-actions'>
            <button
              className='btn-secondary'
              onClick={() => setCollapsed(!collapsed)}
              title='Collapse/Expand preference sections'
            >
              {collapsed ? (
                <ListChevronsDownUpIcon size={24} />
              ) : (
                <ListChevronsUpDownIcon size={24} />
              )}
            </button>
          </div>
        </div>
        <div className='area-content'>
          <div className='area-title space-y-2'>Network Settings</div>
          {!collapsed && (
            <NetworkSelect modified={tempSettings} onModify={handleModify} />
          )}
          <div className='area-title space-y-2'>Theme Settings</div>
          {!collapsed && (
            <ThemeSelect modified={tempSettings} onModify={handleModify} />
          )}
          <div className='area-title space-y-2'>
            Hidden Columns in table views
          </div>
          {!collapsed && (
            <HiddenColumns modified={tempSettings} onModify={handleModify} />
          )}
          <div className='area-title space-y-2'>Header Visibility</div>
          {!collapsed && (
            <HeaderVisibility modified={tempSettings} onModify={handleModify} />
          )}
          <div className='area-title space-y-2'>Sidebar Visibility</div>
          {!collapsed && (
            <SidebarVisibility
              modified={tempSettings}
              onModify={handleModify}
            />
          )}
        </div>
      </div>
    </>
  );
};
