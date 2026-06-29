import type { ReactNode, SyntheticEvent } from 'react';
import { ModalBox } from './ModalBox';

export type ModalDialogProps = {
  onClose: (e?: SyntheticEvent<HTMLDialogElement>) => void;
  caption?: ReactNode;
  content: ReactNode;
  controls?: ReactNode;
  loading?: boolean;
  loadingBody?: ReactNode;
};

export const ModalDialog = ({
  onClose,
  caption,
  content,
  controls,
  loading,
  loadingBody,
}: ModalDialogProps) => (
  <ModalBox onClose={onClose} loading={loading} loadingBody={loadingBody}>
    <ModalBox.Caption>{caption}</ModalBox.Caption>
    <ModalBox.Content>{content}</ModalBox.Content>
    <ModalBox.Controls>{controls}</ModalBox.Controls>
  </ModalBox>
);
