import { makeStore } from '>/services/utils/emitter';
import { DialogState } from '>/types';

type DialogStore = {
  dialog: DialogState | null;
};

const initialState: DialogStore = {
  dialog: null,
};

const baseStore = makeStore<DialogStore>(() => initialState);

const { set, setAuto } = baseStore;

export const dialogStoreActions = {
  openDialog: (dialog: DialogState) => {
    setAuto({ dialog });
  },
  closeDialog: () => {
    setAuto({ dialog: null });
  },

  openDialogAsync: (dialog: DialogState) => {
    setAuto({ dialog }, { wait: true });
  },

  closeDialogAsync: () => {
    setAuto({ dialog: null }, { wait: true });
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
