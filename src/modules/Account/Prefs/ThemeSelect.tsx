import { useEffect } from 'react';
import { useAccountStore } from '>/services/stores';
import { ComboBox, ComboField } from '>/modules';
import { themes } from '>/config';

export const ThemeSelect = () => {
  const { theme, setTheme } = useAccountStore(({ state, api }) => ({
    theme: state.theme,
    setTheme: api.setTheme,
  }));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ComboField
      id='theme-select'
      label='Theme:'
      value={theme}
      onChange={(t) => setTheme(t as string)}
      $options={themes.map((t) => ({
        value: t,
        label: t,
      }))}
      $placeholder='Select Theme'
    />
  );
};
