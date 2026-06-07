import { useMessageStore } from '>/services/stores';
import { MessageBar } from './MessageBar';
import { Message, MessageContent } from '>/types';

type MessageListProps = {
  mode: string | string[]; // "header" or ["header","footer"]
};

export const MessageList = ({ mode }: MessageListProps) => {
  const modes = Array.isArray(mode) ? mode : [mode];

  const { messages, removeMessage } = useMessageStore(({ state, api }) => ({
    messages: modes.flatMap(
      (m) => state.messages[m] ?? [],
    ) as Message<MessageContent>[],
    removeMessage: api.removeMessage,
  }));

  return (
    <>
      {messages.map((msg, idx) => {
        return (
          <MessageBar
            key={`${msg.id}-${idx}`}
            type={msg.type ?? 'error'}
            msg={msg.content.text}
            duration={msg.content.duration}
            onClose={() =>
              msg.id && msg.mode && removeMessage(msg.id, msg.mode)
            }
          />
        );
      })}
    </>
  );
};
