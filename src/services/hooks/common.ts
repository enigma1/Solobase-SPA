// Simple mount check hook
import { useRef, useEffect, useCallback, MutableRefObject } from 'react';

export const useMount = () => {
  const mount = useRef(true);
  useEffect(
    () => () => {
      mount.current = false;
    },
    [],
  );
  return mount;
};

// Implementation example:
// const search = (query: string) => console.log("Searching:", query);
// const {debounced: debouncedSearch, cleanup} = useDebouncer({ callback: search, delay: 300 });

// <input
//   type="text"
//   onChange={(e) => debouncedSearch(e.target.value)}
//   placeholder="Search..."
// />

type DebouncerProps<TArgs extends any[]> = {
  callback: (...args: TArgs) => void;
  delay: number;
};
export const useDebouncer = <TArgs extends any[]>({
  callback,
  delay,
}: DebouncerProps<TArgs>) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const debounce = useCallback(
    (...args: TArgs) => {
      cleanup();
      timerRef.current = setTimeout(() => {
        savedCallback.current(...args);
      }, delay);
    },
    [delay],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return { debounce, cleanup };
};
