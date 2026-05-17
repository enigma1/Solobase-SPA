import axios from 'axios';
import { dbServer } from '>/config';

export const apiClient = axios.create({
  baseURL: dbServer.url,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
