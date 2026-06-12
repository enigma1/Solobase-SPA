import { useRef, useEffect, useState } from 'react';
import { DeleteIcon } from 'lucide-react';

export type MessageBarProps = {
  type: 'error' | 'warn' | 'info' | 'success';
  msg: string;
  duration?: number; // If undefined and no onClose, it's permanent
  onClose?: () => void; // If provided, message can be closed by user
};

export const MessageBar = ({
  type,
  msg,
  duration,
  onClose,
}: MessageBarProps) => {
  const isPermanent = !duration && !onClose;
  const [visible, setVisible] = useState(!!msg);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = null;
    }
  };

  const handleClose = () => {
    setVisible(false);
    clearTimer();
    onClose?.();
  };

  useEffect(() => {
    if (!msg) return;
    if (!isPermanent) setVisible(true);
    clearTimer();

    if (duration) {
      tRef.current = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
    }
    return clearTimer; // Cleanup on unmount
  }, [msg, duration, isPermanent]);

  if (!msg || (!isPermanent && !visible)) return null;

  // CSS styles for different message types
  const typeStyles = {
    error: {
      color: 'var(--color-text)',
      backgroundColor:
        'linear-gradient(75deg in oklch, var(--color-error-bg) 25%, var(--color-srf-elevated) 100%)',
    },
    warn: {
      color: 'var(--color-text)',
      backgroundColor:
        'linear-gradient(75deg in oklch, var(--color-warn-bg) 25%, var(--color-srf-elevated) 100%)',
    },
    info: {
      color: 'var(--color-text)',
      backgroundColor:
        'linear-gradient(75deg in oklch, var(--color-info-bg) 25%, var(--color-srf-elevated) 100%)',
    },
    success: {
      color: 'var(--color-text)',
      background:
        'linear-gradient(75deg in oklch, var(--color-success-bg) 25%, var(--color-srf-elevated) 100%)',
    },
  };

  // Animation (using the custom fade-out animation)
  const animationClasses = duration
    ? // ? 'opacity-100 animate-fade-out'
      'opacity-100'
    : 'opacity-100';

  return (
    <div
      className={`${animationClasses} px-4 py-2 rounded-lg shadow-md flex justify-between items-center`}
      style={{
        ...typeStyles[type],
        animationDuration: duration ? `${duration}ms` : '0ms',
      }}
    >
      <span>{msg}</span>
      {onClose && (
        <button
          className='flex items-center justify-center'
          onClick={handleClose}
        >
          <DeleteIcon size={24} />
        </button>
      )}
    </div>
  );
};
