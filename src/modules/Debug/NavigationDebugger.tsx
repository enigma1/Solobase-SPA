import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const NavigationDebugger = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (window as any).nav = navigate;
  }, []);

  return null;
};
