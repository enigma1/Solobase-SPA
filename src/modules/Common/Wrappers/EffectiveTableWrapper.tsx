import { ReactNode, RefObject } from 'react';
import { Pagination } from '>/modules';
export const EffectiveTableWrapper = ({
  children,
  outerRef,
  resizeLineRef,
  tableRef,
}: {
  children: ReactNode;
  outerRef: RefObject<HTMLDivElement | null>;
  resizeLineRef: RefObject<HTMLDivElement | null>;
  tableRef: RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div ref={outerRef} className='table-wrapper'>
      <div ref={resizeLineRef} className='resize-line' />
      <div ref={tableRef}>{children}</div>
    </div>
  );
};
