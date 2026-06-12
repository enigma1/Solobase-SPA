// comparisonUtils.test.ts

import {
  comparisonTypes,
  compareObjects,
  addComparisonType,
} from './comparisons';

describe('comparisonTypes.objectIs', () => {
  it('returns true for identical primitives', () => {
    expect(comparisonTypes.objectIs(1, 1)).toBe(true);
  });

  it('returns false for different primitives', () => {
    expect(comparisonTypes.objectIs(1, 2)).toBe(false);
  });

  it('handles NaN correctly', () => {
    expect(comparisonTypes.objectIs(NaN, NaN)).toBe(true);
  });

  it('distinguishes +0 and -0', () => {
    expect(comparisonTypes.objectIs(+0, -0)).toBe(false);
  });
});

describe('comparisonTypes.jsonCompare', () => {
  it('returns true for equal objects', () => {
    expect(comparisonTypes.jsonCompare({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(
      true,
    );
  });

  it('returns false for different objects', () => {
    expect(comparisonTypes.jsonCompare({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('is sensitive to key order', () => {
    expect(comparisonTypes.jsonCompare({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(
      false,
    );
  });
});

describe('comparisonTypes.keysCompare', () => {
  it('returns true when objects have the same keys', () => {
    expect(comparisonTypes.keysCompare({ a: 1, b: 2 }, { a: 99, b: 100 })).toBe(
      true,
    );
  });

  it('returns true regardless of key order', () => {
    expect(comparisonTypes.keysCompare({ a: 1, b: 2 }, { b: 3, a: 4 })).toBe(
      true,
    );
  });

  it('returns false when keys differ', () => {
    expect(comparisonTypes.keysCompare({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(
      false,
    );
  });
});

describe('comparisonTypes.shallowEqual', () => {
  it('returns true for the same reference', () => {
    const obj = { a: 1 };

    expect(comparisonTypes.shallowEqual(obj, obj)).toBe(true);
  });

  it('returns true for shallowly equal objects', () => {
    expect(
      comparisonTypes.shallowEqual({ a: 1, b: 'test' }, { a: 1, b: 'test' }),
    ).toBe(true);
  });

  it('returns false when values differ', () => {
    expect(comparisonTypes.shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false when key counts differ', () => {
    expect(comparisonTypes.shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('returns false when one value is null', () => {
    expect(comparisonTypes.shallowEqual({ a: 1 }, null)).toBe(false);
  });

  it('does not perform deep equality', () => {
    expect(
      comparisonTypes.shallowEqual({ nested: { a: 1 } }, { nested: { a: 1 } }),
    ).toBe(false);
  });
});

describe('comparisonTypes.shallowCheckFromLeft', () => {
  it('returns true when all left-side properties match', () => {
    expect(comparisonTypes.shallowCheckFromLeft({ a: 1 }, { a: 1, b: 2 })).toBe(
      true,
    );
  });

  it('returns false when a left-side property differs', () => {
    expect(comparisonTypes.shallowCheckFromLeft({ a: 1 }, { a: 2, b: 2 })).toBe(
      false,
    );
  });

  it('returns true for an empty left object', () => {
    expect(comparisonTypes.shallowCheckFromLeft({}, { a: 1 })).toBe(true);
  });
});

describe('compareObjects', () => {
  it('uses jsonCompare by default', () => {
    expect(compareObjects({ a: 1 }, { a: 1 })).toBe(true);
  });

  it('uses the specified comparison type', () => {
    expect(compareObjects({ a: 1 }, { a: 2 }, 'keysCompare')).toBe(true);
  });

  it('returns false for unknown comparison types', () => {
    expect(compareObjects({ a: 1 }, { a: 1 }, 'doesNotExist')).toBe(false);
  });
});

describe('addComparisonType', () => {
  it('adds a custom comparison function', () => {
    addComparisonType('alwaysTrue', () => true);

    expect(compareObjects({ a: 1 }, { a: 999 }, 'alwaysTrue')).toBe(true);
  });

  it('overwrites an existing comparison type', () => {
    addComparisonType('customCheck', (a, b) => a.id === b.id);

    expect(
      compareObjects(
        { id: 1, name: 'foo' },
        { id: 1, name: 'bar' },
        'customCheck',
      ),
    ).toBe(true);
  });
});
