import { SqlRow } from '>/types';
import { PreviewTable } from '>/modules';

type DatabaseExportPreviewProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};
export const DatabaseExportPreview = ({
  rows,
  columnsOrder,
}: DatabaseExportPreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>This action will export the databases shown below.</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};

type DatabasesDeletePreviewProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};
export const DatabasesDeletePreview = ({
  rows,
  columnsOrder,
}: DatabasesDeletePreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>This action will permanently delete the databases shown below.</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};
