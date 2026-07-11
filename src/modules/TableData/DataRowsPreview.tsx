import { SqlRow } from '>/types';
import { PreviewTable } from '>/modules';

type DataRowsExportPreviewProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};
export const DataRowsExportPreview = ({
  rows,
  columnsOrder,
}: DataRowsExportPreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>This action will export the data rows shown below.</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};

type DataRowsDeletePreviewProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};
export const DataRowsDeletePreview = ({
  rows,
  columnsOrder,
}: DataRowsDeletePreviewProps) => {
  const fit = columnsOrder.length <= 3 ? 'w-fit' : '';
  return (
    <div className='preview-table-wrapper'>
      <p>This action will permanently delete the data rows shown below.</p>
      <PreviewTable
        extraClassName={fit}
        columnsOrder={columnsOrder}
        rows={rows}
      />
    </div>
  );
};
