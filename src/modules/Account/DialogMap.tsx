import { ReactNode } from 'react';
import { ModalDialog } from '>/modules/.';

type ErrorAccountRecord = {
  title: string;
  msg: string | undefined;
};

type DialogMapFieldOutput = Record<string, () => ReactNode>;
type DialogMapFieldProps<TPayload = Record<string, unknown>> = {
  payload?: TPayload;
  onClose: () => void;
};

const ErrorItem = ({ error }: { error: ErrorAccountRecord }) => (
  <div className='border rounded p-4 space-y-1'>
    <div className='font-semibold'>{error.title}</div>
    <div className='text-sm opacity-70'>{error.msg}</div>
  </div>
);

export const accountDialogMap = ({
  payload,
  onClose,
}: DialogMapFieldProps): DialogMapFieldOutput => ({
  updateRecord: () => {
    if (!payload) return null;

    const { userName, onConfirm } = payload as {
      userName: string;
      onConfirm: () => void;
    };

    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption='Updating record'
        content={`Updating record ${userName}?`}
        controls={
          <div className='flex gap-2 justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded border opacity-80'
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className='px-4 py-2 rounded border font-medium'
            >
              Confirm
            </button>
          </div>
        }
      />
    );
  },

  deleteUser: () => {
    if (!payload) return null;

    const { userName, onConfirm } = payload as {
      userName: string;
      onConfirm: () => void;
    };

    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption='Deleting User'
        content={`The following user will be removed ${userName}`}
        controls={
          <div className='flex gap-2 justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded border opacity-80'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='px-4 py-2 rounded border font-medium'
            >
              Confirm
            </button>
          </div>
        }
      />
    );
  },

  validateUser: () => (
    <ModalDialog
      isOpen
      onClose={onClose}
      caption='Validate User'
      content='Please confirm the range is valid.'
      controls={
        <button
          onClick={onClose}
          className='px-4 py-2 rounded border font-medium'
        >
          OK
        </button>
      }
    />
  ),
  errorLogin: () => {
    if (!payload) return null;

    const { error, onClear } = payload as {
      error: ErrorAccountRecord;
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
            onClick={onClose}
            className='px-4 py-2 rounded border font-medium'
          >
            OK
          </button>
        }
      />
    );
  },
  errorLogout: () => {
    console.log('errorLogout:', payload);

    if (!payload) return null;

    const { error, onClear } = payload as {
      error: ErrorAccountRecord;
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
            onClick={onClose}
            className='px-4 py-2 rounded border font-medium'
          >
            OK
          </button>
        }
      />
    );
  },
  confirmLogout: () => {
    const { onConfirm, onCancelLogout } = payload as {
      onConfirm: () => void;
      onCancelLogout: () => void;
    };

    return (
      <ModalDialog
        isOpen
        onClose={onCancelLogout}
        caption='Confirm Logout'
        content='Are you sure you want to logout?'
        controls={
          <>
            <button
              onClick={onCancelLogout}
              className='px-4 py-2 rounded border opacity-80'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='px-4 py-2 rounded border font-medium'
            >
              Confirm
            </button>
          </>
        }
      />
    );
  },
});
