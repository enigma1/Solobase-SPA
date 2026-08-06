import { getAppConfig } from '>/config';
import { AppConfigSchema } from '>/contracts';

const validated = AppConfigSchema.parse(getAppConfig());
export const userPrefs = Object.freeze(validated.userPrefs);
export const appSettings = Object.freeze(validated.appSettings);
export const appInfo = Object.freeze(validated.appInfo);
export const backPath = `${window.location.protocol}//${window.location.hostname}`;
