import { makeStore } from '>/services/utils/emitter';
import { DialogState, DialogStore, ApiError, LocalError } from '>/types';

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
  setError: (response: ApiError | LocalError | null) => void;
  getError: () => ApiError | LocalError | null;
  clearError: () => void;
};

export const dialogStoreActions: DialogStoreActions = {
  openDialog: (dialog) => {
    // setAuto({ dialog, response: null });
    setAuto({ dialog });
  },
  closeDialog: () => {
    setAuto({ dialog: null, response: null });
  },

  openDialogAsync: async (dialog) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    // await setAuto({ dialog, response: null }, { wait: true });
    await setAuto({ dialog });
  },

  closeDialogAsync: async () => {
    await setAuto({ dialog: null, response: null }, { wait: true });
  },
  getActive: () => get().dialog,
  getError: () => get().response,
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
