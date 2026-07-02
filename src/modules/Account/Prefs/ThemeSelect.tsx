import { useConfigStore } from '>/services/stores';
import { ComboField } from '>/modules';
import { themes } from '>/config';
import { ItemPreferenceProps } from '>/types';

export const ThemeSelect = ({ onModify }: ItemPreferenceProps) => {
  const { theme, setTheme } = useConfigStore(({ state, api }) => ({
    theme: state.theme,
    setTheme: api.setTheme,
  }));

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
      $options={themes.map((t) => ({
        value: t,
        label: t,
      }))}
      $placeholder='Select Theme'
    />
  );
};
