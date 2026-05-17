// apiCaller.test.js
import { makeApiCaller, api } from './apiCaller.js';

const callApi = makeApiCaller(api);

describe('makeApiCaller', () => {
  test('create returns result', async () => {
    const result = await callApi('create', { name: 'Test' });
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  test('getAll returns array', async () => {
    const result = await callApi('getAll');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('remove calls handlers', (done) => {
    callApi(
      'remove',
      { id: 5 },
      {
        onSuccess: (val) => {
          expect(val).toBe(true);
          done();
        },
        onFailure: (err) => done(err),
      },
    );
  });

  test('getAll with handlers', (done) => {
    callApi('getAll', undefined, {
      onSuccess: (val) => {
        expect(val).toEqual(['a', 'b', 'c']);
        done();
      },
      onFailure: (err) => done(err),
    });
  });
});
