import { makeStore } from '>/services/utils/emitter';

type UtilitiesState = {
  hiddenColumns: Record<string, boolean>;
};

export type UtilitiesActions = {
  initialize: () => void;
  getHiddenColumns: () => Record<string, boolean>;
  setHiddenColumns: (
    cols:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
};

export type UtilitiesStore = UtilitiesState & UtilitiesActions;

const initialState: UtilitiesState = {
  hiddenColumns: {},
};

const baseStore = makeStore<UtilitiesState>(() => ({ ...initialState }));
const { get, set, setAuto } = baseStore;

export const utilitiesStoreActions: UtilitiesActions = {
  initialize: () => {
    set(() => ({ ...initialState }));
  },

  setHiddenColumns: (colsOrFn) => {
    setAuto((state) => {
      const next =
        typeof colsOrFn === 'function'
          ? colsOrFn(state.hiddenColumns)
          : colsOrFn;

      return { hiddenColumns: { ...next } };
    });
  },
  getHiddenColumns: () => get().hiddenColumns,
};

type SelectorProps = {
  state: UtilitiesState;
  api: UtilitiesActions;
};
export const useUtilitiesStore = <TSelected = SelectorProps>(
  selector?: (args: SelectorProps) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = utilitiesStoreActions;
  const store = { state, api };
  return selector ? selector(store) : (store as TSelected);
};
