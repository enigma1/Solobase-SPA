import { SqlRow } from '>/types';
import { PreviewTable } from '>/modules';

type QueriesDeletePreviewProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};
export const QueriesDeletePreview = ({
  rows,
  columnsOrder,
}: QueriesDeletePreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>This action will permanently delete the queries shown below.</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};
