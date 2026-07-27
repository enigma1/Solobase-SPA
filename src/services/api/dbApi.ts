import type { AxiosResponse } from 'axios';
import { queriesStoreActions } from '>/services/stores';
import { apiClient } from './client';
import { handleApiAxios } from './apiHelpers';

import {
  BasicResponse,
  AbortResponse,
  CleanupResponse,
  SessionRestoreResponse,
  LoginRequest,
  LoginResponse,
  RunRawQueryRequest,
  RunRawQueryResponse,
  FetchDatabasesRequest,
  FetchDatabasesResponse,
  FetchTablesRequest,
  FetchTablesResponse,
  FetchRowsRequest,
  FetchRowsResponse,
  FetchDatabaseInfoResponse,
  DeleteDataRowsRequest,
  DeleteDataRowsResponse,
  UpdateDataRowsRequest,
  UpdateDataRowsResponse,
  CreateDataRowsRequest,
  CreateDataRowsResponse,
  CreateUserRequest,
  CreateUserResponse,
  EditUserRequest,
  EditUserResponse,
  FetchUsersRequest,
  FetchUsersResponse,
  DeleteUsersRequest,
  DeleteUsersResponse,
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
  ExportTablesRequest,
  ImportDataRequest,
  ImportDataResponse,
  GetTableDetailsRequest,
  GetTableDetailsResponse,
  GetTableColumnsInfoRequest,
  GetTableColumnsInfoResponse,
  LoadPreferencesRequest,
  LoadPreferencesResponse,
  SavePreferencesRequest,
  SavePreferencesResponse,
} from './dbApiTypes';
import { QueryLogEntry } from '>/types';

type ApiOptions = {
  signal?: AbortSignal;
};

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

apiClient.interceptors.request.use((config) => {
  config.headers['Solobase-SPA-Version'] = (
    window as any
  ).APP_CONFIG.appInfo.appVersion;
  return config;
});

const apiCall = <T>(fn: () => Promise<AxiosResponse<T>>) =>
  handleApiAxios(async () => {
    const res = await fn();

    if (Array.isArray((res.data as any)?.queries)) {
      queriesStoreActions.addExecutedQueries((res.data as any).queries);
    }

    return res.data;
  });

const apiCallRaw = <T>(fn: () => Promise<AxiosResponse<T>>) =>
  handleApiAxios(async () => {
    return await fn();
  });

const ping = () => apiCall<BasicResponse>(() => apiClient.get('/api/active'));
const checkSession = () =>
  apiCall<SessionRestoreResponse>(() => apiClient.get('/api/check-session'));

const cleanup = () =>
  apiCall<CleanupResponse>(() => apiClient.get('/auth/cleanup'));

const sessionRestore = () =>
  apiCall<SessionRestoreResponse>(() => apiClient.get('/auth/presence'));

const abort = () => apiCall<AbortResponse>(() => apiClient.get('/db/abort'));

const login = (data: LoginRequest) =>
  apiCall<LoginResponse>(() => apiClient.post('/auth/login', data));
const logout = () =>
  apiCall<BasicResponse>(() => apiClient.get('/auth/logout'));

const importData = (data: ImportDataRequest, { signal }: ApiOptions) =>
  apiCall<ImportDataResponse>(() =>
    apiClient.post('/db/import-data', data, { signal, timeout: 600_000 }),
  );

const runRawQuery = (data: RunRawQueryRequest, { signal }: ApiOptions) =>
  apiCall<RunRawQueryResponse>(() =>
    apiClient.post('/db/run-raw-query', data, { timeout: 300_000, signal }),
  );

const exportDatabases = (data: ExportDatabasesRequest) =>
  apiCallRaw(() =>
    apiClient.post('/db/export-databases', data, {
      responseType: 'blob',
      timeout: 0, // Let it finish
    }),
  );

const exportTables = (data: ExportTablesRequest) =>
  apiCallRaw(() =>
    apiClient.post('/db/export-tables', data, {
      responseType: 'blob',
      timeout: 0, // Let it finish
    }),
  );

const fetchUsers = (data: FetchUsersRequest) =>
  apiCall<FetchUsersResponse>(() => apiClient.post('/db/fetch-users', data));
const createUser = (data: CreateUserRequest) =>
  apiCall<CreateUserResponse>(() => apiClient.post('/db/create-user', data));
const editUser = (data: EditUserRequest) =>
  apiCall<EditUserResponse>(() => apiClient.post('/db/edit-user', data));
const deleteUsers = (data: DeleteUsersRequest) =>
  apiCall<DeleteUsersResponse>(() => apiClient.post('/db/delete-users', data));

const fetchDatabases = (data: FetchDatabasesRequest) =>
  apiCall<FetchDatabasesResponse>(() =>
    apiClient.post('/db/fetch-databases', data),
  );

const getTableDetails = (data: GetTableDetailsRequest) =>
  apiCall<GetTableDetailsResponse>(() =>
    apiClient.post('/db/get-table-details', data),
  );

const getTableColumnsInfo = (data: GetTableColumnsInfoRequest) =>
  apiCall<GetTableColumnsInfoResponse>(() =>
    apiClient.post('/db/get-table-columns-info', data),
  );

const fetchTables = (data: FetchTablesRequest) =>
  apiCall<FetchTablesResponse>(() => apiClient.post('/db/fetch-tables', data));

const fetchRows = (data: FetchRowsRequest) =>
  apiCall<FetchRowsResponse>(() => apiClient.post('/db/fetch-rows', data));

const createDataRows = (data: CreateDataRowsRequest) =>
  apiCall<CreateDataRowsResponse>(() =>
    apiClient.post('/db/create-data-rows', data),
  );

const deleteDataRows = (data: DeleteDataRowsRequest) =>
  apiCall<DeleteDataRowsResponse>(() =>
    apiClient.post('/db/delete-data-rows', data),
  );
const updateDataRows = (data: UpdateDataRowsRequest) =>
  apiCall<UpdateDataRowsResponse>(() =>
    apiClient.post('/db/update-data-rows', data),
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
    apiClient.post('/db/delete-databases', data, { timeout: 0 }),
  );

const createTable = (data: CreateTableRequest) =>
  apiCall<CreateTableResponse>(() => apiClient.post('/db/create-table', data));

const editTable = (data: EditTableRequest) =>
  apiCall<EditTableResponse>(() => apiClient.post('/db/edit-table', data));

const deleteTables = (data: DeleteTablesRequest) =>
  apiCall<DeleteTablesResponse>(() =>
    apiClient.post('/db/delete-tables', data),
  );

const savePreferences = (data: SavePreferencesRequest) =>
  apiCall<SavePreferencesResponse>(() =>
    apiClient.post('/app/save-preferences', data),
  );
const loadPreferences = (data: LoadPreferencesRequest) =>
  apiCall<LoadPreferencesResponse>(() =>
    apiClient.post('/app/load-preferences', data),
  );

export const dbApi = {
  ping,
  checkSession,
  abort,
  cleanup,
  getTableDetails,
  getTableColumnsInfo,
  fetchDatabaseInfo,
  sessionRestore,
  login,
  logout,
  fetchUsers,
  fetchDatabases,
  fetchTables,
  fetchRows,
  importData,
  runRawQuery,
  createDataRows,
  deleteDataRows,
  updateDataRows,
  createUser,
  editUser,
  selectDatabase,
  createDatabase,
  editDatabase,
  deleteDatabases,
  createTable,
  editTable,
  deleteTables,
  deleteUsers,
  savePreferences,
  loadPreferences,
  exportDatabases,
  exportTables,
} as const;
