import { dbApi } from '>/services/api/dbApi';
import {
  getSingleColumnFromResult,
  createFileSaveUrl,
} from '>/services/utils/result';
import {
  dialogStoreActions,
  configStoreActions,
  columnsStoreActions,
} from '>/services/stores';
import { dialogFactories } from '>/modules/Common/DialogRenderer/dialogFactories';
import { SqlRow } from '>/types';

const changeColumnsActivePrefs = (col: string, hidden: boolean) => {
  const { [col]: removed, ...rest } = columnsStoreActions.getHiddenColumns();
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
        hiddenColumns: columnsStoreActions.getHiddenColumns(),
        columnsOrder,
        onChange: changeColumnsActivePrefs,
      },
    }),
  });
};

export const openUnsavedChangesConfirmation = () =>
  new Promise<boolean>((resolve) => {
    dialogStoreActions.openDialog({
      payload: dialogFactories.confirmation({
        caption: 'Unsaved Changes',
        note: 'Edits in data-rows will be lost',
        message: 'You have unsaved changes. Switch Tables?',
        onConfirm: () => {
          dialogStoreActions.closeDialog();
          resolve(true);
        },
        onCancel: () => {
          dialogStoreActions.closeDialog();
          resolve(false);
        },
      }),
    });
  });

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
