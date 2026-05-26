export type MessageMode = 'header' | 'footer' | 'toast' | 'page' | 'top';
export type StatusType = 'error' | 'success' | 'info' | 'warn';
export type Message<TContent> = {
  id?: string;
  type?: StatusType;
  mode?: MessageMode;
  content: TContent;
};

export type MessageContent = { text: string; duration?: number };
