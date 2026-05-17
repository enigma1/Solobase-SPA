import { expect, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// import PouchDB from 'pouchdb';
// import memoryAdapter from 'pouchdb-adapter-memory';
// import { setDbInstance, resetDbInstance } from '>/api/dbInstance'; // update this path to your db module
// import { dbApi } from '>/api/db'; // update this path to your db module

// PouchDB.plugin(memoryAdapter);

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  // const uniqueName = `testDb_${Date.now()}_${Math.random()
  //   .toString(36)
  //   .substring(2)}`;
  // globalThis.testDb = new PouchDB(uniqueName, { adapter: 'memory' });
  // setDbInstance(globalThis.testDb);
  // globalThis.gdb = dbApi(globalThis.testDb);
});

afterEach(async () => {
  // await resetDbInstance();
  // globalThis.gdb = null;
});
