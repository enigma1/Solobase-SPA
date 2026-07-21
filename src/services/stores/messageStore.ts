import { v4 as uuidv4 } from 'uuid';
import { makeStore } from '>/services/utils/emitter';
import { Message, MessageMode } from '>/types';

type StoreState<TContent> = {
  messages: Record<string, Message<TContent>[]>;
};

export type MessageStoreActions<TContent> = {
  addMessage: (msg: Message<TContent>) => string;
  removeMessage: (id: string, mode: MessageMode) => void;
  clearMessages: (mode?: MessageMode) => void;
  getMessages: (mode: MessageMode) => Message<TContent>[];
};

export type MessageStore<TContent> = StoreState<TContent> &
  MessageStoreActions<TContent>;

const initialState: StoreState<unknown> = {
  messages: {},
};

const baseStore = makeStore<StoreState<unknown>>(() => ({ ...initialState }));
const { get, setAuto } = baseStore;

export const messageStoreActions: MessageStoreActions<unknown> = {
  addMessage: (msg) => {
    const params = {
      ...msg,
      mode: msg.mode ?? 'header',
      type: msg.type ?? 'error',
      id: msg.id ?? uuidv4(),
    };
    setAuto((state) => ({
      messages: {
        ...state.messages,
        [params.mode]: [...(state.messages[params.mode] ?? []), params],
      },
    }));
    return params.id;
  },

  removeMessage: (id, mode) => {
    setAuto((state) => ({
      messages: {
        ...state.messages,
        [mode]: (state.messages[mode] ?? []).filter((m) => m.id !== id),
      },
    }));
  },

  clearMessages: (mode) => {
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

  getMessages: (mode) => {
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
