import { apiClient } from './client';
import { handleApiAxios } from './apiHelpers';
import { routes } from '>/config/routes';

import {
  BasicResponse,
  SessionRestoreResponse,
  LoginRequest,
  LoginResponse,
  RunQueryRequest,
  RunQueryResponse,
  FetchDatabasesResponse,
  FetchTablesRequest,
  FetchTablesResponse,
  FetchRowsRequest,
  FetchRowsResponse,
  FetchDatabaseInfoResponse,
  UpdateRowsRequest,
  UpdateRowsResponse,
  SelectDatabaseRequest,
  SelectDatabaseResponse,
  CreateDatabaseRequest,
  CreateDatabaseResponse,
  EditDatabaseRequest,
  EditDatabaseResponse,
  DeleteDatabasesRequest,
  DeleteDatabasesResponse,
  CreateTableRequest,
  CreateTableResponse,
  EditTableRequest,
  EditTableResponse,
  DeleteTablesRequest,
  DeleteTablesResponse,
  ExportDatabasesRequest,
  ExportDatabasesResponse,
} from './dbApiTypes';
import { DbTable, PrimeObject } from '>/types';

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Server unreachable');
    } else {
      console.error('API error:', error.response.status);
    }
    return Promise.reject(error);
  },
);

const apiCall = <T>(fn: () => Promise<any>, unwrap = true) =>
  handleApiAxios(async () => {
    const res = await fn();
    return unwrap ? res.data : res;
  });

const ping = () => apiCall<{ ok: true }>(() => apiClient.get('/api/active'));

const sessionRestore = () =>
  apiCall<SessionRestoreResponse>(() => apiClient.get('/auth/presence'));

const login = (data: LoginRequest) =>
  apiCall<LoginResponse>(() => apiClient.post('/auth/login', data));
const logout = () =>
  apiCall<BasicResponse>(() => apiClient.get('/auth/logout'));

const runQuery = (data: RunQueryRequest, signal?: AbortSignal) =>
  apiCall<RunQueryResponse>(() =>
    apiClient.post('/db/run-query', data, { signal }),
  );
const fetchDatabases = () =>
  apiCall<FetchDatabasesResponse>(() => apiClient.get('/db/fetch-databases'));

const fetchTables = (data: FetchTablesRequest) =>
  apiCall<FetchTablesResponse>(() => apiClient.post('/db/fetch-tables', data));
const fetchRows = (data: FetchRowsRequest) =>
  apiCall<FetchRowsResponse>(() => apiClient.post('/db/fetch-rows', data));

const updateRows = (data: UpdateRowsRequest) =>
  apiCall<UpdateRowsResponse>(() => apiClient.post('/db/update-rows', data));

const exportDatabase = () =>
  apiCall<UpdateRowsResponse>(() => apiClient.get('/db/export-database'));

const exportDatabases = (data: ExportDatabasesRequest) =>
  apiCall(
    () =>
      apiClient.post('/db/export-databases', data, {
        responseType: 'blob',
      }),
    false,
  );

const fetchDatabaseInfo = () =>
  apiCall<FetchDatabaseInfoResponse>(() =>
    apiClient.get('/db/fetch-database-info'),
  );

const selectDatabase = (data: SelectDatabaseRequest) =>
  apiCall<SelectDatabaseResponse>(() =>
    apiClient.post('/db/select-database', data),
  );

const createDatabase = (data: CreateDatabaseRequest) =>
  apiCall<CreateDatabaseResponse>(() =>
    apiClient.post('/db/create-database', data),
  );

const editDatabase = (data: EditDatabaseRequest) =>
  apiCall<EditDatabaseResponse>(() =>
    apiClient.post('/db/edit-database', data),
  );

const deleteDatabases = (data: DeleteDatabasesRequest) =>
  apiCall<DeleteDatabasesResponse>(() =>
    apiClient.post('/db/delete-databases', data),
  );

const createTable = (data: CreateTableRequest) =>
  apiCall<CreateTableResponse>(() => apiClient.post('/db/create-table', data));

const editTable = (data: EditTableRequest) =>
  apiCall<EditTableResponse>(() => apiClient.post('/db/edit-table', data));

const deleteTables = (data: DeleteTablesRequest) =>
  apiCall<DeleteTablesResponse>(() =>
    apiClient.post('/db/delete-tables', data),
  );

const saveSettings = (data: PrimeObject) =>
  apiCall<void>(() => apiClient.post('/db/save-settings', data));
const loadSettings = () =>
  apiCall<PrimeObject>(() => apiClient.get('/db/load-settings'));

export const dbApi = {
  ping,
  fetchDatabaseInfo,
  sessionRestore,
  login,
  logout,
  createUser: (data: any) =>
    apiCall(() => apiClient.post('/db/create-user', data)),
  fetchDatabases,
  fetchTables,
  fetchRows,
  runQuery,
  updateRows,
  selectDatabase,
  exportDatabase,
  createDatabase,
  editDatabase,
  deleteDatabases,
  createTable,
  editTable,
  deleteTables,
  saveSettings,
  loadSettings,
  exportDatabases,
};
