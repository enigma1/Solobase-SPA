import { makeStore } from '>/services/utils/emitter';
import { Message } from '>/types';

type StoreState<TContent> = {
  messages: Record<string, Message<TContent>[]>;
};

export type MessageStoreActions<TContent> = {
  addMessage: (msg: Message<TContent>) => void;
  removeMessage: (id: string, mode: string) => void;
  clearMessages: (mode?: string) => void;
  getMessages: (mode: string) => Message<TContent>[];
};

export type MessageStore<TContent> = StoreState<TContent> &
  MessageStoreActions<TContent>;

const initialState: StoreState<unknown> = {
  // messages: [],
  messages: {},
};

const baseStore = makeStore<StoreState<unknown>>(() => initialState);
const { get, setAuto } = baseStore;

export const messageStoreActions = {
  addMessage: (msg: Message<unknown>) => {
    setAuto((state) => ({
      messages: {
        ...state.messages,
        [msg.mode]: [...(state.messages[msg.mode] ?? []), msg],
      },
    }));
  },

  removeMessage: (id: string, mode: string) => {
    setAuto((state) => ({
      messages: {
        ...state.messages,
        [mode]: (state.messages[mode] ?? []).filter((m) => m.id !== id),
      },
    }));
  },

  clearMessages: (mode?: string) => {
    if (mode) {
      setAuto((state) => ({
        messages: {
          ...state.messages,
          [mode]: [],
        },
      }));
    } else {
      setAuto(() => ({ messages: {} }));
    }
  },

  getMessages: (mode: string) => {
    return get().messages[mode] ?? [];
  },
};

type SelectorArgsType = {
  state: StoreState<unknown>;
  api: MessageStoreActions<unknown>;
};
export const useMessageStore = <TContent, TSelected = StoreState<TContent>>(
  selector?: (args: SelectorArgsType) => TSelected,
): TSelected => {
  const state = baseStore();
  const api = messageStoreActions;
  return selector ? selector({ state, api }) : ({ state, api } as TSelected);
};
