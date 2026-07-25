import { makeStore } from '>/services/utils/emitter';
import { DialogState, DialogStore, ApiError } from '>/types';

const initialState: DialogStore = {
  dialog: null,
  response: null,
};

const baseStore = makeStore<DialogStore>(() => ({ ...initialState }));
const { get, setAuto } = baseStore;

export type DialogStoreActions = {
  openDialog: (dialog: DialogState) => void;
  closeDialog: () => void;
  openDialogAsync: (dialog: DialogState) => Promise<void>;
  closeDialogAsync: () => Promise<void>;
  getActive: () => DialogState | null;
  setError: (response: ApiError | null) => void;
  clearError: () => void;
};

export const dialogStoreActions: DialogStoreActions = {
  openDialog: (dialog) => {
    setAuto({ dialog, response: null });
  },
  closeDialog: () => {
    setAuto({ dialog: null, response: null });
  },

  openDialogAsync: async (dialog) => {
    await setAuto({ dialog, response: null }, { wait: true });
  },

  closeDialogAsync: async () => {
    await setAuto({ dialog: null, response: null }, { wait: true });
  },
  getActive: () => get().dialog,
  setError: (response) => {
    setAuto({ response });
  },
  clearError: () => setAuto({ response: null }),
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
