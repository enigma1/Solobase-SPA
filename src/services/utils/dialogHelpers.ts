import { dbApi } from '>/services/api/dbApi';
import {
  getSingleColumnFromResult,
  createFileSaveUrl,
} from '>/services/utils/result';
import { dialogStoreActions, configStoreActions } from '>/services/stores';
import { dialogFactories } from '>/modules';
import { SqlRow } from '>/types';

const changeColumnsActivePrefs = (col: string, hidden: boolean) => {
  const { [col]: removed, ...rest } = configStoreActions.getHiddenColumns();
  configStoreActions.savePreferences({
    hiddenColumns: {
      ...rest,
      ...(hidden && { [col]: true }),
    },
  });
};

export const makeColumnsActive = (columnsOrder: string[]) => {
  dialogStoreActions.openDialog({
    payload: dialogFactories.filterColumns({
      filterProps: {
        hiddenColumns: configStoreActions.getHiddenColumns(),
        columnsOrder,
        onChange: changeColumnsActivePrefs,
      },
    }),
  });
};

// type ProcessDownloads = {
//   rows: SqlRow[];
//   columnsOrder: string[];
//   field: string;
// };
// export const processDownloads = async ({
//   rows,
//   columnsOrder,
//   field,
// }: ProcessDownloads) => {
//   const entriesToExport = getSingleColumnFromResult({
//     rows,
//     columnsOrder,
//     field,
//   });
//   const rsp = await dbApi.exportDatabases({ databases: entriesToExport });
//   const disposition = rsp.headers['content-disposition'];
//   const match = disposition?.match(/filename="(.+)"/);
//   const filename = match?.[1] ?? 'export.sql.gz';
//   createFileSaveUrl(rsp.data, filename);
// };
