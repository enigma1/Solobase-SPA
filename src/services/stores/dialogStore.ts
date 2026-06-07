import { makeStore } from '>/services/utils/emitter';
import { DialogState, DialogStore } from '>/types';

const initialState: DialogStore = {
  dialog: null,
};

const baseStore = makeStore<DialogStore>(() => ({ ...initialState }));
const { setAuto } = baseStore;

export type DialogStoreActions = {
  openDialog: (dialog: DialogState) => void;
  closeDialog: () => void;
  openDialogAsync: (dialog: DialogState) => Promise<void>;
  closeDialogAsync: () => Promise<void>;
};

export const dialogStoreActions: DialogStoreActions = {
  openDialog: (dialog) => {
    setAuto({ dialog });
  },
  closeDialog: () => {
    setAuto({ dialog: null });
  },

  openDialogAsync: async (dialog) => {
    await setAuto({ dialog }, { wait: true });
  },

  closeDialogAsync: async () => {
    await setAuto({ dialog: null }, { wait: true });
  },
};

type DialogProps = {
  state: DialogStore;
  api: typeof dialogStoreActions;
};

export const useDialogStore = <TSelected = DialogProps>(
  selector?: (props: DialogProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = dialogStoreActions;

  return selector ? selector({ state, api }) : ({ state, api } as TSelected);
};
