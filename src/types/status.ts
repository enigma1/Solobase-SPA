export type MessageType = 'error' | 'success' | 'info' | 'warn' | 'notice';
export type Message<TContent> = {
  id: string;
  type: MessageType;
  mode: string;
  content: TContent;
};

export type MessageContent = { text: string; duration?: number };
