import isEqual from 'lodash-es/isEqual';

export type EqualityFn<U = any> = (a: U, b: U) => boolean;

// Base comparison types
export const comparisonTypes: Record<string, EqualityFn> = {
  objectIs: Object.is, // default shallow comparison
  jsonCompare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  keysCompare: (a, b) => {
    const aKeysSorted = Object.keys(a).sort();
    const bKeysSorted = Object.keys(b).sort();
    return JSON.stringify(aKeysSorted) === JSON.stringify(bKeysSorted);
  },
  shallowCheckFromLeft: (a, b) =>
    Object.entries(a).every(([k, v]) => b[k] === v),
  isEqual, // lodash isEqual
};

// Helper to compare objects with optional type selection
export const compareObjects = (a: any, b: any, type: string = 'jsonCompare') =>
  comparisonTypes[type]?.(a, b) ?? false;

// Extend comparisonTypes dynamically
export const addComparisonType = (name: string, fn: EqualityFn) => {
  comparisonTypes[name] = fn;
};
