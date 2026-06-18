import { ReactNode } from 'react';

export const TitleArea = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <>
      {title}
      {children}
    </>
  );
};
