import { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ListChevronsDownUpIcon,
  ListChevronsUpDownIcon,
} from 'lucide-react';
import { getAppConfig, getPrefs } from '>/config';
import { useModal } from '>/services/hooks';
import { useSavePreferencesWrap } from '>/services/queryHooks';
import {
  messageStoreActions,
  configStoreActions,
  accountStoreActions,
  queriesStoreActions,
  historyStoreActions,
} from '>/services/stores';
import { ScreenLoader } from '>/modules';
import {
  ThemeSelect,
  HiddenColumns,
  HeaderVisibility,
  SidebarVisibility,
  NetworkSelect,
  PageSizing,
  CopiedRows,
  Queries,
} from './Prefs';
import { UserPrefs, CommonDialogHandlers } from '>/types';

const sections = [
  'network',
  'theme',
  'pageSizing',
  'headerVisibility',
  'sidebarVisibility',
  'hiddenColumns',
  'copiedRows',
  'queries',
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
      <div className='wrapper rounded-sm'>
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
  const [saveCount, setSaveCount] = useState<number>(0);

  const [collapsedSections, setCollapsedSections] = useState<
    Record<PreferenceSection, boolean>
  >(
    () =>
      Object.fromEntries(
        sections.map((section) => [section, false]),
      ) as PreferenceObject,
  );

  const onSaveSuccess = () => {
    setSaveCount((count) => count + 1);
  };

  const { mutate, isPending } = useSavePreferencesWrap({
    onSuccess: onSaveSuccess,
  });

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

  const [tempSettings, setTempSettings] = useState<UserPrefs>({
    ...configStoreActions.getPreferences(),
    queries: {
      ...queriesStoreActions.getQueries(),
    },
    copiedRows: {
      ...historyStoreActions.getCopiedRows(),
    },
  });

  const { setButtonStatus } = useModal();

  const onConfirm = () => {
    const userPrefs = {
      ...getPrefs(),
      ...tempSettings,
    };
    mutate({ version: getAppConfig().appInfo.storageVersion, userPrefs });
  };

  const handleModify = (props: Partial<UserPrefs>) => {
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
      {isPending && <ScreenLoader />}
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
            <NetworkSelect
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
          <PreferenceSection
            title='Theme Settings'
            collapsed={collapsedSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <ThemeSelect
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
          <PreferenceSection
            title='Page Sizing'
            collapsed={collapsedSections.pageSizing}
            onToggle={() => toggleSection('pageSizing')}
          >
            <PageSizing
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>

          <PreferenceSection
            title='Header Visibility'
            collapsed={collapsedSections.headerVisibility}
            onToggle={() => toggleSection('headerVisibility')}
          >
            <HeaderVisibility
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
          <PreferenceSection
            title='Sidebar Visibility'
            collapsed={collapsedSections.sidebarVisibility}
            onToggle={() => toggleSection('sidebarVisibility')}
          >
            <SidebarVisibility
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
          <PreferenceSection
            title='Hidden Columns in table views'
            collapsed={collapsedSections.hiddenColumns}
            onToggle={() => toggleSection('hiddenColumns')}
          >
            <HiddenColumns
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
          <PreferenceSection
            title='Saved Data Rows'
            collapsed={collapsedSections.copiedRows}
            onToggle={() => toggleSection('copiedRows')}
          >
            <CopiedRows
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
          <PreferenceSection
            title='Queries'
            collapsed={collapsedSections.queries}
            onToggle={() => toggleSection('queries')}
          >
            <Queries
              modified={tempSettings}
              onModify={handleModify}
              saveCount={saveCount}
            />
          </PreferenceSection>
        </div>
      </div>
    </>
  );
};
