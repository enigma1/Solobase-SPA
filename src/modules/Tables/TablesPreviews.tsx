import { SqlRow } from '>/types';
import { PreviewTable } from '>/modules';

type DatabaseExportPreviewProps = {
  database: string;
  rows: SqlRow[];
  columnsOrder: string[];
};
export const TablesExportPreview = ({
  database,
  rows,
  columnsOrder,
}: DatabaseExportPreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>{`This action will export the followin tables from database ${database}.`}</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};

type TablesDeletePreviewProps = {
  database: string;
  rows: SqlRow[];
  columnsOrder: string[];
};
export const TablesDeletePreview = ({
  database,
  rows,
  columnsOrder,
}: TablesDeletePreviewProps) => {
  return (
    <div className='preview-table-wrapper'>
      <p>{`This action will permanently delete the tables from database ${database} shown below.`}</p>
      <PreviewTable columnsOrder={columnsOrder} rows={rows} />
    </div>
  );
};
