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
        onClose={onClose}
        caption='Updating record'
        content={`Updating record ${userName}?`}
        controls={
          <div className='btn-group'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>

            <button onClick={onConfirm} className='btn'>
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
        onClose={onClose}
        caption='Deleting User'
        content={`The following user will be removed ${userName}`}
        controls={
          <div className='btn-group'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>
            <button onClick={onConfirm} className='btn'>
              Confirm
            </button>
          </div>
        }
      />
    );
  },

  validateUser: () => (
    <ModalDialog
      onClose={onClose}
      caption='Validate User'
      content='Please confirm the range is valid.'
      controls={
        <button onClick={onClose} className='btn'>
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
        onClose={onClose}
        caption={error.title}
        content={<ErrorItem error={error} />}
        controls={
          <button onClick={onClose} className='btn'>
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
        onClose={onClose}
        caption={error.title}
        content={<ErrorItem error={error} />}
        controls={
          <button onClick={onClose} className='btn'>
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
        onClose={onCancelLogout}
        caption='Confirm Logout'
        content='Are you sure you want to logout?'
        controls={
          <div className='btn-group'>
            <button onClick={onCancelLogout} className='btn-secondary'>
              Cancel
            </button>
            <button onClick={onConfirm} className='btn'>
              Confirm
            </button>
          </div>
        }
      />
    );
  },
});
