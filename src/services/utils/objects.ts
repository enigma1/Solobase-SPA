import { z } from 'zod';
import { isEqual, cloneDeep, merge } from 'lodash-es';
import { pageSizeValues } from './appSettings';
import type {
  BasicResponse,
  PagingRequest,
  PagingResponse,
} from '>/services/api';
import type { BasicRowsShape, PagingParams } from '>/types';

export const defaultPageRequest: PagingRequest = {
  paging: {
    limit: pageSizeValues[0],
    offset: 0,
  },
};

export const defaultPageResponse: PagingResponse = {
  paging: {
    hasPrevious: false,
    hasNext: false,
  },
};

export const defaultPaging: PagingParams = {
  limit: pageSizeValues[0],
  offset: 0,
  hasNext: false,
  hasPrevious: false,
};

export const defaultResponse: BasicResponse = {
  ok: false,
  message: 'Warning - No Request made, this is a dummy response',
  route: '#',
  queries: [],
};

export const defaultListResponse: BasicRowsShape = {
  rows: [],
  cols: {},
  columnsOrder: [],
};

export const defaultCapabilities: string[] = [];

export const hasObject = <T extends Record<string, unknown>>(
  target: T,
  list: T[],
): boolean => list.some((item) => isEqual(item, target));

export const getIndexBySomeProps = <T extends Record<string, unknown>>(
  target: Partial<T>,
  list: T[],
  keys: (keyof T)[],
): number => {
  return list.findIndex((item) =>
    keys.every((key) => target[key] === item[key]),
  );
};

export const hasIndexBySomeProps = <T extends Record<string, unknown>>(
  target: Partial<T>,
  list: T[],
  keys: (keyof T)[],
): boolean => getIndexBySomeProps(target, list, keys) !== -1;

export const setIfNotEqual = <T>(
  set: CallableFunction,
  original: T,
  change: Partial<T>,
  deep = false,
): boolean => {
  const updated = deep
    ? merge(cloneDeep(original), change)
    : { ...original, ...change };
  if (!isEqual(original, updated)) {
    set((prev: T) => ({ ...prev, ...updated }));
    return true;
  }
  return false;
};

export const isObjectWithStringProperty = <K extends string>(
  obj: unknown,
  key: K,
): obj is Record<K, string> => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }
  return typeof (obj as Record<K, unknown>)[key] === 'string';
};

export const hasObjectProps = <K extends string>(
  obj: unknown,
  props: K[],
): obj is Record<K, unknown> => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  return props.every((key) => key in obj);
};

export const hasStringPropValue = <K extends string, V extends string>(
  obj: unknown,
  key: K,
  value: V,
): obj is Record<K, V> => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  return (obj as Record<K, unknown>)[key] === value;
};

export const isObjectEmpty = (obj: unknown): boolean =>
  obj !== null && typeof obj === 'object' && Object.keys(obj).length === 0;

export const isValidIndex = (
  idx: number | null,
  arr: unknown[],
): idx is number => idx !== null && idx >= 0 && idx < arr.length;

export const getSchemaFromSample = (obj: unknown): z.ZodType<unknown> => {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return z.array(z.unknown());
    }
    return z.array(getSchemaFromSample(obj[0]));
  }

  if (obj !== null && typeof obj === 'object') {
    const shape: Record<string, z.ZodType<unknown>> = {};

    for (const key in obj as Record<string, unknown>) {
      shape[key] = getSchemaFromSample((obj as Record<string, unknown>)[key]);
    }

    return z.object(shape).strict();
  }

  switch (typeof obj) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    default:
      return z.any();
  }
};
