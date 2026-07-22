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
  e: React.PointerEvent;
  sidebarRef: RefObject<HTMLElement | null>;
};
export const startSidebarResize = ({ e, sidebarRef }: StartSidebarResize) => {
  e.preventDefault();

  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  const startWidth = sidebarRef.current!.offsetWidth;
  const startClientX = e.clientX;

  const onPointerMove = (moveEvent: PointerEvent) => {
    const delta = moveEvent.clientX - startClientX;
    const newWidth = startWidth + delta;

    sidebarRef.current!.style.width = `${newWidth}px`;
  };

  const onPointerUp = () => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    configStoreActions.savePreferences({
      sidebarWidth: sidebarRef.current!.offsetWidth,
    });
  };

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
};

export const useColumnResize = (
  columnsOrder: string[],
  outerRef: RefObject<HTMLElement | null>,
  resizeLineRef: RefObject<HTMLDivElement | null>,
) => {
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  const startResize = (e: React.PointerEvent, key: string) => {
    e.preventDefault();

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const parent = e.currentTarget.parentElement as HTMLElement;
    const startWidth = parent.offsetWidth;
    const startClientX = e.clientX;

    const onPointerMove = (moveEvent: PointerEvent) => {
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
    };

    const onPointerUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      if (resizeLineRef.current) {
        resizeLineRef.current!.style.opacity = '0';
      }

      setColWidths((prev) => {
        return {
          ...prev,
          [key]: parent.offsetWidth,
          // [lastColKey]: lastColWidth,
        };
      });
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
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
