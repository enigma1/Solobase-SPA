import { useConfigStore } from '>/services/stores';
import { useThemeOptions } from '>/services/hooks';
import { ComboField } from '>/modules';
import { ItemPreferenceProps } from '>/types';

export const ThemeSelect = ({ onModify }: ItemPreferenceProps) => {
  const { theme, setTheme } = useConfigStore(({ state, api }) => ({
    theme: state.theme,
    setTheme: api.setTheme,
  }));

  const groupedThemes = useThemeOptions();

  return (
    <ComboField
      id='theme-select'
      label='Theme:'
      value={theme}
      onChange={(t) => {
        onModify({
          theme: t as string,
        });
        setTheme(t as string);
      }}
      $groups={groupedThemes}
      $placeholder='Select Theme'
    />
  );
};
