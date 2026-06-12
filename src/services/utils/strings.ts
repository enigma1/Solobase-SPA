export const isEmptyString = (s: unknown): s is string =>
  typeof s === 'string' && s.length === 0;
export const isAlphanumeric = (key: string) => /^[a-z0-9]+$/i.test(key);
export const kebabCase = (str: string) =>
  str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export const trimString = (query: string) => query.replace(/\s+/g, ' ').trim();

export const isNonEmptyString = (s: unknown): s is string =>
  typeof s === 'string' && s.trim().length > 0;

export const extractNameFromRequired = (param: string) =>
  param
    .replace(/\s*\*$/, '')
    .trim()
    .toLowerCase();
