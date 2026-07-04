import { ReactNode } from 'react';

type ScreenLoaderProps = { children?: ReactNode };
export const ScreenLoader = ({ children }: ScreenLoaderProps) => {
  return (
    <div className='overlay-wrapper animate-[fadeIn_0.2s_ease-in-out]'>
      <div className='content'>
        <div className='spinner' />
        {children}
      </div>
    </div>
  );
};
