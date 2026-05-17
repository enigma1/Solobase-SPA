import { ReactNode } from 'react';

type ScreenLoaderProps = { children?: ReactNode };
export const ScreenLoader = ({ children }: ScreenLoaderProps) => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/10 z-50 animate-[fadeIn_0.2s_ease-in-out]'>
      <div className='w-9 h-9 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
      {children}
    </div>
  );
};
