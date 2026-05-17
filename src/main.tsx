import './styles/globals.css';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { QueryClientProvider } from '@tanstack/react-query';

import { App } from './app/App';
import { queryClient } from './config/reactQuery';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found to start dbManagerJs');
}

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
