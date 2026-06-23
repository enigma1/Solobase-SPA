import { SqlRow } from '>/types';
import { PreviewTable } from '>/modules';

type UsersDeletePreviewProps = {
  rows: SqlRow[];
  columnsOrder: string[];
};

export const UsersDeletePreview = ({
  rows,
  columnsOrder,
}: UsersDeletePreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>{`This action will permanently delete the following users.`}</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};
