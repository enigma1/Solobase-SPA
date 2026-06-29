import {
  useState,
  useLayoutEffect,
  RefObject,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import { configStoreActions } from '>/services/stores';

const MIN_WIDTH = 80;

type StartSidebarResize = {
  e: React.MouseEvent;
  sidebarRef: RefObject<HTMLElement | null>;
};
export const startSidebarResize = ({ e, sidebarRef }: StartSidebarResize) => {
  e.preventDefault();

  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  const startWidth = sidebarRef.current!.offsetWidth;
  const startClientX = e.clientX;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startClientX;
    const newWidth = startWidth + delta;

    sidebarRef.current!.style.width = `${newWidth}px`;
  };

  const onMouseUp = () => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    configStoreActions.savePreferences({
      sidebarWidth: sidebarRef.current!.offsetWidth,
    });
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

export const useColumnResize = (
  columnsOrder: string[],
  outerRef: RefObject<HTMLElement | null>,
  resizeLineRef: RefObject<HTMLDivElement | null>,
) => {
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  const startResize = (e: React.MouseEvent, key: string) => {
    e.preventDefault();

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const parent = e.currentTarget.parentElement as HTMLElement;
    const startWidth = parent.offsetWidth;
    const startClientX = e.clientX;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = outerRef.current!.getBoundingClientRect();
      const delta = moveEvent.clientX - startClientX;
      const newWidth = Math.max(MIN_WIDTH, startWidth + delta);
      // Must happen before getting the parent rect again, otherwise there is a weird 1px jump when resizing back and forth
      parent.style.width = `${newWidth}px`;

      const parentRect = parent.getBoundingClientRect();
      const x = parentRect.right - rect.left + outerRef.current!.scrollLeft;
      if (resizeLineRef.current) {
        resizeLineRef.current.style.left = `${x}px`;
        resizeLineRef.current!.style.opacity = '1';
      }

      // console.log('mousemove', {
      //   x,
      //   ref: resizeLineRef.current,
      // });
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (resizeLineRef.current) {
        resizeLineRef.current!.style.opacity = '0';
      }

      setColWidths((prev) => {
        // const lastColKey = columnsOrder[columnsOrder.length - 1];

        // Sum all columns except the last, taking the updated width for the dragged column
        // const sumExceptLast = columnsOrder
        //   .slice(0, -1)
        //   .reduce((sum, colKey) => {
        //     return sum + (prev[colKey] ?? 0); // old width
        //   }, 0);

        // const containerWidth = outerRef?.current?.offsetWidth ?? 0;
        // const lastColWidth = Math.max(containerWidth - sumExceptLast, 80);
        return {
          ...prev,
          [key]: parent.offsetWidth,
          // [lastColKey]: lastColWidth,
        };
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // initialize column widths
  useEffect(() => {
    if (!outerRef?.current || columnsOrder.length === 0) {
      setColWidths({});
      return;
    }

    const containerWidth = outerRef?.current?.offsetWidth;
    const columnWidth = Math.max(
      150,
      Math.floor(containerWidth / columnsOrder.length),
    );
    const initial = Object.fromEntries(
      columnsOrder.map((col) => [col, columnWidth]),
    );
    setColWidths(initial);
  }, [outerRef?.current, columnsOrder.length]);

  return { colWidths, startResize, setColWidths };
};

type EffectiveTableWidthProps = {
  outerRef: RefObject<HTMLDivElement | null>;
  colWidths: Record<string, number>;
  columnsOrder: string[];
};

export const useEffectiveTableWidth = ({
  outerRef,
  colWidths,
  columnsOrder,
}: EffectiveTableWidthProps) => {
  const [effectiveWidth, setEffectiveWidth] = useState<number | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    if (!outerRef?.current) return;

    const recalc = () => {
      const outerWidth = outerRef.current?.offsetWidth ?? 0;
      const totalColumnWidth = columnsOrder.reduce(
        (sum, colName) => sum + (colWidths[colName] ?? 0),
        0,
      );

      setEffectiveWidth(
        totalColumnWidth > outerWidth ? totalColumnWidth : undefined,
      );
    };

    // Initial calculation
    recalc();

    const observer = new ResizeObserver(() => {
      recalc();
    });

    // Observe the outer container
    observer.observe(outerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [outerRef, colWidths, columnsOrder]);

  return effectiveWidth;
};
