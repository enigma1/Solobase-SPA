import { ReactNode } from 'react';
import { ModalDialog } from '>/modules/.';
import { BasicRecord, ErrorItem } from '>/modules/Common/DialogRenderer';

type DialogMapFieldOutput = Record<string, () => ReactNode>;
type DialogMapFieldProps<TPayload = Record<string, unknown>> = {
  payload?: TPayload;
  onClose: () => void;
};

export const dbDialogMap = ({
  payload,
  onClose,
}: DialogMapFieldProps): DialogMapFieldOutput => ({
  errorTables: () => {
    if (!payload) return null;

    const { error, onClear } = payload as {
      error: BasicRecord;
      onClear: () => void;
    };

    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption={error.title}
        content={<ErrorItem error={error} />}
        controls={
          <button
            onClick={onClear}
            className='px-4 py-2 rounded border font-medium'
          >
            OK
          </button>
        }
      />
    );
  },
});
