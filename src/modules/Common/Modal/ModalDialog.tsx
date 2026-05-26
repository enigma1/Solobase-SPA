import { ReactNode } from 'react';
import { ModalBox } from './ModalBox';

export type ModalDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  caption?: string | ReactNode;
  content: string | ReactNode;
  controls: ReactNode;
  loading?: boolean;
  loadingBody?: React.ReactNode;
};

export const ModalDialog = ({
  isOpen,
  onClose,
  caption,
  content,
  controls,
  loading,
  loadingBody,
}: ModalDialogProps) => (
  <ModalBox
    isOpen={isOpen}
    onClose={onClose}
    loading={loading}
    loadingBody={loadingBody}
  >
    <ModalBox.Caption>{caption}</ModalBox.Caption>
    <ModalBox.Content>{content}</ModalBox.Content>
    <ModalBox.Controls>{controls}</ModalBox.Controls>
  </ModalBox>
);
