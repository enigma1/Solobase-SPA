import { updateRowsTransformer } from './helpers';

describe('updateRowsTransformer', () => {
  test('transforms component shape into API format', () => {
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

    const result = updateRowsTransformer(props);
    expect(result).toEqual({
      table: 'test_table',
      dataRows: [
        {
          updatedValues: { col2: 'value1', col3: 'value2' },
          originalRow: [1, 'original9', 'original2', 'original1', 'original6'],
          rowIndex: 0,
        },
        {
          updatedValues: { col2: 'value4', col5: 'value3' },
          originalRow: [2, 'original3', 'original4', 'original3', 'original7'],
          rowIndex: 1,
        },
      ],
    });
  });
});
