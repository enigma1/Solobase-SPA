import { ReactNode } from 'react';

export type DialogState = { type: string; payload?: Record<string, any> };

type DialogMapProps = {
  payload?: Record<string, any>;
  onClose: () => void;
};

export type DialogMap = (
  props: DialogMapProps,
) => Record<string, () => ReactNode>;
