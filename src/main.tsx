import './styles/globals.css';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { QueryClientProvider } from '@tanstack/react-query';
import { configStoreActions } from '>/services/stores/configStore';
import { apiClient } from '>/services/api/client';
import { App } from './app/App';
import { queryClient } from './config/reactQuery';

type WindowConfig = {
  userPrefs: Record<string, string | number>;
};
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found to start dbManagerJs');
}

const config = (window as any).APP_CONFIG;
const { userPrefs, appSettings } = config;
configStoreActions.initialize(userPrefs);

ReactDOM.createRoot(container).render(
  /*
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
      */
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion='never'>
      <App />
    </MotionConfig>
  </QueryClientProvider>,
);
