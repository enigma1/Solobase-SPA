import { createContext, useContext } from 'react';
import { DialogSizes, DialogVariants, ButtonStatus } from '>/types';

type ModalContextValue = {
  onClose: () => void;
  variant?: DialogVariants;
  initialSize?: DialogSizes;
  buttonsStatus: Record<string, ButtonStatus>;
  setButtonStatus: (button: string, status?: ButtonStatus) => void;
  setButtonsStatuses: (updates: Partial<Record<string, ButtonStatus>>) => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside ModalBox');
  return ctx;
};
