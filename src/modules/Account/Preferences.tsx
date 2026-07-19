import { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ListChevronsDownUpIcon,
  ListChevronsUpDownIcon,
} from 'lucide-react';
import { useModal } from '>/services/hooks';
import { useSavePreferencesMutation } from '>/services/queryHooks';
import {
  messageStoreActions,
  configStoreActions,
  accountStoreActions,
  queriesStoreActions,
  historyStoreActions,
} from '>/services/stores';
import {
  ThemeSelect,
  HiddenColumns,
  HeaderVisibility,
  SidebarVisibility,
  NetworkSelect,
  PageSizing,
} from './Prefs';
import { CommonDialogHandlers, StorageConfig } from '>/types';
import { SavePreferencesResponse } from '>/services/api/dbApiTypes';

const sections = [
  'network',
  'theme',
  'hiddenColumns',
  'pageSizing',
  'headerVisibility',
  'sidebarVisibility',
] as const;

type PreferenceSection = (typeof sections)[number];
type PreferenceObject = Record<PreferenceSection, boolean>;

type PreferenceSectionProps = {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export const PreferenceSection = ({
  title,
  collapsed,
  onToggle,
  children,
}: PreferenceSectionProps) => {
  return (
    <>
      <div className='flex flex-col rounded-sm'>
        <div className='preference-section-header'>
          <span className='one-line'>{title}</span>

          <button
            className='btn-micro'
            onClick={onToggle}
            title={collapsed ? 'Expand section' : 'Collapse section'}
          >
            {collapsed ? (
              <ChevronLeftIcon size={16} />
            ) : (
              <ChevronDownIcon size={16} />
            )}
          </button>
        </div>
      </div>

      {!collapsed && children}
    </>
  );
};

type PreferencesProps = {
  formHandlers: CommonDialogHandlers;
};
export const Preferences = ({ formHandlers }: PreferencesProps) => {
  const [collapsedSections, setCollapsedSections] = useState<
    Record<PreferenceSection, boolean>
  >(
    () =>
      Object.fromEntries(
        sections.map((section) => [section, true]),
      ) as PreferenceObject,
  );

  const callbacks = {
    onSuccess: (data: SavePreferencesResponse) => {
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Preferences Saved', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          type: 'warn',
          content: {
            text: data.message ?? 'Error saving preferences',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to save preferences', duration: 3000 },
      });
    },
  };

  const { mutate, isPending } = useSavePreferencesMutation(
    ({ api, query }) => ({
      mutate: api.mutate,
      isPending: query.isPending,
    }),
    callbacks,
  );

  const toggleAllSections = () => {
    const shouldCollapse = Object.values(collapsedSections).some(
      (collapsed) => !collapsed,
    );

    setCollapsedSections(
      Object.fromEntries(
        sections.map((section) => [section, shouldCollapse]),
      ) as PreferenceObject,
    );
  };
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [tempSettings, setTempSettings] = useState<StorageConfig>(
    configStoreActions.getPreferences(),
  );
  const { setButtonStatus } = useModal();

  const onConfirm = () => {
    const appConfig = (window as any).APP_CONFIG;
    const userPrefs = {
      ...appConfig.userPrefs,
      ...configStoreActions.getPreferences(),
      ...tempSettings,
      queries: {
        ...queriesStoreActions.getQueries(),
      },
      copiedRows: {
        ...historyStoreActions.getCopiedRows(),
      },
    };
    mutate({ version: appConfig.appInfo.storageVersion, userPrefs });
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
          <h1 className='area-title'>{`Preferences for [${accountStoreActions.getUsername()}]`}</h1>
          <div className='area-actions'>
            <button
              className='btn-secondary'
              onClick={toggleAllSections}
              title='Collapse/Expand preference sections'
            >
              {Object.values(collapsedSections).every(Boolean) ? (
                <ListChevronsDownUpIcon size={24} />
              ) : (
                <ListChevronsUpDownIcon size={24} />
              )}
            </button>
          </div>
        </div>
        <div className='area-content'>
          <PreferenceSection
            title='Network Settings'
            collapsed={collapsedSections.network}
            onToggle={() => toggleSection('network')}
          >
            <NetworkSelect modified={tempSettings} onModify={handleModify} />
          </PreferenceSection>
          <PreferenceSection
            title='Theme Settings'
            collapsed={collapsedSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <ThemeSelect modified={tempSettings} onModify={handleModify} />
          </PreferenceSection>
          <PreferenceSection
            title='Hidden Columns in table views'
            collapsed={collapsedSections.hiddenColumns}
            onToggle={() => toggleSection('hiddenColumns')}
          >
            <HiddenColumns modified={tempSettings} onModify={handleModify} />
          </PreferenceSection>
          <PreferenceSection
            title='Page Sizing'
            collapsed={collapsedSections.pageSizing}
            onToggle={() => toggleSection('pageSizing')}
          >
            <PageSizing modified={tempSettings} onModify={handleModify} />
          </PreferenceSection>

          <PreferenceSection
            title='Header Visibility'
            collapsed={collapsedSections.headerVisibility}
            onToggle={() => toggleSection('headerVisibility')}
          >
            <HeaderVisibility modified={tempSettings} onModify={handleModify} />
          </PreferenceSection>
          <PreferenceSection
            title='Sidebar Visibility'
            collapsed={collapsedSections.sidebarVisibility}
            onToggle={() => toggleSection('sidebarVisibility')}
          >
            <SidebarVisibility
              modified={tempSettings}
              onModify={handleModify}
            />
          </PreferenceSection>
        </div>
      </div>
    </>
  );
};
