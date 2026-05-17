export const compactTable = (table: HTMLTableElement, pack?: boolean) => {
  const headers = Array.from(
    table.querySelectorAll<HTMLTableCellElement>('th'),
  );

  headers.forEach((th) => {
    if (pack) {
      th.style.width = '0px';
    } else {
      th.style.width = 'auto';
      const minWidth = th.scrollWidth;
      th.style.width = `${minWidth}px`;
    }
  });
};
