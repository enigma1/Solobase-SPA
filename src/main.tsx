import './styles/globals.css';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { App } from './app/App';
import { queryClient } from './config/reactQuery';
import { configStoreActions } from './services/stores';

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Solobase-SPA: Root element not found - will not start reactjs',
  );
}

configStoreActions.setTheme();
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
