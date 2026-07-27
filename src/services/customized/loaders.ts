import { customThemes } from '>/config';
import { handleLocalRequests, createResourceLoadError } from './handlers';

type ThemeItem = {
  name: string;
  css: string;
};

const appendThemeCss = async (theme: ThemeItem): Promise<void> => {
  console.log('setting external-theme', theme);
  const existing = document.querySelector(`link[data-theme="${theme.name}"]`);

  if (existing) {
    return;
  }

  const link = document.createElement('link');

  link.rel = 'stylesheet';
  link.dataset.theme = theme.name;
  link.href = theme.css;

  await new Promise<void>((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = (e) => {
      const error = createResourceLoadError(
        `Unable to load theme stylesheet: ${theme.css}`,
        'resource',
      );
      console.log('some-error', e);
      reject(error);
    };

    document.head.appendChild(link);
  });
};

export const loadExternalTheme = async (themeName: string): Promise<void> => {
  const externalTheme = customThemes.find((t) => t.name === themeName);

  if (!externalTheme) {
    return; // built-in theme
  }

  await handleLocalRequests(() => appendThemeCss(externalTheme));
};
