import axios from 'axios';
// import { dbServer } from '>/config';

// const endpoint = configStoreActions.getBackend();
export const apiClient = axios.create({
  // baseURL: dbServer.url,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
