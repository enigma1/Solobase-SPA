import {
  updateRowsCollectionTransformer,
  updateRowsSqlTransformer,
} from './helpers';

describe('updateRowsCollectionTransformer', () => {
  it('transforms collection rows into API format', () => {
    const props = {
      componentShape: {
        row1: {
          _id: 'row1',
          name: 'Updated Name',
        },
        row2: {
          _id: 'row2',
          name: 'Another Name',
        },
      },
      table: 'users',
      originalRows: [
        {
          _id: 'row1',
          name: 'Original Name',
        },
        {
          _id: 'row2',
          name: 'Original Name 2',
        },
      ],
    };

    expect(updateRowsCollectionTransformer(props)).toEqual({
      table: 'users',
      dataRows: [
        {
          updatedValues: {
            _id: 'row1',
            name: 'Updated Name',
          },
          originalRow: {
            _id: 'row1',
            name: 'Original Name',
          },
        },
        {
          updatedValues: {
            _id: 'row2',
            name: 'Another Name',
          },
          originalRow: {
            _id: 'row2',
            name: 'Original Name 2',
          },
        },
      ],
    });
  });

  it('throws when a row cannot be found', () => {
    const props = {
      componentShape: {
        missingRow: {
          _id: 'missingRow',
          name: 'Test',
        },
      },
      table: 'users',
      originalRows: [],
    };

    expect(() => updateRowsCollectionTransformer(props)).toThrow(
      'Row with _id missingRow not found',
    );
  });

  it('returns an empty dataRows array when componentShape is empty', () => {
    const props = {
      componentShape: {},
      table: 'users',
      originalRows: [],
    };

    expect(updateRowsCollectionTransformer(props)).toEqual({
      table: 'users',
      dataRows: [],
    });
  });
});

describe('updateRowsSqlTransformer', () => {
  it('transforms component shape into API format', () => {
    const props = {
      componentShape: {
        0: {
          1: 'value1',
          2: 'value2',
        },
        1: {
          4: 'value3',
          1: 'value4',
        },
      },
      table: 'test_table',
      originalRows: [
        [1, 'original9', 'original2', 'original1', 'original6'],
        [2, 'original3', 'original4', 'original3', 'original7'],
        [3, 'original4', 'original5', 'original4', 'original8'],
      ],
      cols: {
        col1: { field: 'col1' },
        col2: { field: 'col2' },
        col3: { field: 'col3' },
        col4: { field: 'col4' },
        col5: { field: 'col5' },
      },
    };

    expect(updateRowsSqlTransformer(props)).toEqual({
      table: 'test_table',
      dataRows: [
        {
          updatedValues: {
            col2: 'value1',
            col3: 'value2',
          },
          originalRow: [1, 'original9', 'original2', 'original1', 'original6'],
          rowIndex: 0,
        },
        {
          updatedValues: {
            col2: 'value4',
            col5: 'value3',
          },
          originalRow: [2, 'original3', 'original4', 'original3', 'original7'],
          rowIndex: 1,
        },
      ],
    });
  });

  it('returns an empty dataRows array when componentShape is empty', () => {
    const props = {
      componentShape: {},
      table: 'test_table',
      originalRows: [],
      cols: {},
    };

    expect(updateRowsSqlTransformer(props)).toEqual({
      table: 'test_table',
      dataRows: [],
    });
  });

  it('maps numeric column indexes to column names correctly', () => {
    const props = {
      componentShape: {
        0: {
          0: 'id',
          2: 'email@test.com',
        },
      },
      table: 'users',
      originalRows: [[1, 'John', 'old@test.com']],
      cols: {
        id: { field: 'id' },
        name: { field: 'name' },
        email: { field: 'email' },
      },
    };

    expect(updateRowsSqlTransformer(props)).toEqual({
      table: 'users',
      dataRows: [
        {
          updatedValues: {
            id: 'id',
            email: 'email@test.com',
          },
          originalRow: [1, 'John', 'old@test.com'],
          rowIndex: 0,
        },
      ],
    });
  });
});
