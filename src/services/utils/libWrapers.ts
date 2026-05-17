import classNames from 'classnames';
import { merge, cloneDeep } from 'lodash-es';
import { DeepValue } from '>/types';

// Enhanced classNames wrapper.
// Normalizes whitespace and allows for future extensions.
export const cx = (...args: Parameters<typeof classNames>): string =>
  classNames(...args)
    .replace(/\s+/g, ' ') // collapse all whitespace
    .trim(); // remove leading/trailing space

export const cloneStructure = <T extends Record<string, unknown>>(
  original: DeepValue<T>,
  extra?: Partial<DeepValue<T>>,
): DeepValue<T> => {
  if (!extra) return cloneDeep(original);
  return merge(cloneDeep(original), extra);
};

export const deepCopyStructure = <T extends Record<string, unknown>>(
  original: T,
  extra?: Partial<T>,
): T => {
  if (!extra) return cloneDeep(original);
  return merge(cloneDeep(original), extra);
};
