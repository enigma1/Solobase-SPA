import { useMemo } from 'react';
import { themes, customThemes } from '>/config';

export const useThemeOptions = () => {
  return useMemo(() => {
    return [
      {
        label: 'Main Themes',
        options: themes.map((theme) => ({
          value: theme,
          label: theme,
        })),
      },
      {
        label: 'Extras',
        options: customThemes.map((theme) => ({
          value: theme.name,
          label: theme.name,
        })),
      },
    ];
  }, [customThemes]);
};
