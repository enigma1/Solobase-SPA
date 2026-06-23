import { useState, useEffect } from 'react';
import { ListChevronsDownUpIcon, ListChevronsUpDownIcon } from 'lucide-react';
import { useModal } from '>/services/hooks';
import {
  ThemeSelect,
  HiddenColumns,
  HeaderVisibility,
  SidebarVisibility,
} from './Prefs';
import { CommonDialogHandlers } from '>/types';

type PreferencesProps = {
  formHandlers: CommonDialogHandlers;
};
export const Preferences = ({ formHandlers }: PreferencesProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);
  const [save, setSave] = useState<boolean>(false);
  const { setButtonStatus } = useModal();

  const onConfirm = () => {
    setSave(true);
    setDirty(false);
  };

  useEffect(() => {
    setButtonStatus('confirm', !dirty ? 'disabled' : undefined);
    if (!dirty) setSave(false);
  }, [dirty, save]);

  useEffect(() => {
    formHandlers.confirm = onConfirm;
  }, [onConfirm]);

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
          <div className='area-title space-y-2'>Theme Settings</div>
          {!collapsed && <ThemeSelect />}
          <div className='area-title space-y-2'>
            Hidden Columns in table views
          </div>
          {!collapsed && (
            <HiddenColumns onModify={() => setDirty(true)} save={save} />
          )}
          <div className='area-title space-y-2'>Header Visibility</div>
          {!collapsed && <HeaderVisibility />}
          <div className='area-title space-y-2'>Sidebar Visibility</div>
          {!collapsed && <SidebarVisibility />}
        </div>
      </div>
    </>
  );
};
