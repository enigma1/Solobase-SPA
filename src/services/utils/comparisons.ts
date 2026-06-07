export type EqualityFn<U = any> = (a: U, b: U) => boolean;

// Base comparison types
export const comparisonTypes: Record<string, EqualityFn> = {
  objectIs: Object.is, // strict equality (use this the default comparison)
  jsonCompare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  keysCompare: (a, b) => {
    const aKeysSorted = Object.keys(a).sort();
    const bKeysSorted = Object.keys(b).sort();
    return JSON.stringify(aKeysSorted) === JSON.stringify(bKeysSorted);
  },
  shallowEqual: (a, b) => {
    if (Object.is(a, b)) return true;
    if (!a || !b) return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every((k) => Object.is(a[k], b[k]));
  },
  shallowCheckFromLeft: (a, b) =>
    Object.entries(a).every(([k, v]) => Object.is(v, b[k])),
};

// Helper to compare objects with optional type selection
export const compareObjects = (a: any, b: any, type: string = 'jsonCompare') =>
  comparisonTypes[type]?.(a, b) ?? false;

// Extend comparisonTypes dynamically
export const addComparisonType = (name: string, fn: EqualityFn) => {
  comparisonTypes[name] = fn;
};
