import { useRef, useEffect, useState } from 'react';

export type MessageBarProps = {
  type: 'error' | 'warn' | 'info' | 'success' | 'notice';
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

  // Tailwind classes for different message types
  const typeClasses = {
    error: 'text-red-800 bg-red-100',
    warn: 'text-yellow-800 bg-yellow-100',
    info: 'text-blue-800 bg-blue-100',
    success: 'text-green-800 bg-green-100',
    notice: 'text-purple-800 bg-purple-100',
  };

  // Tailwind for the animation (using the custom fade-out animation)
  const animationClasses = duration
    ? 'opacity-100 animate-fade-out'
    : 'opacity-100';

  return (
    <div
      className={`${typeClasses[type]} ${animationClasses} p-4 rounded-lg shadow-md flex justify-between items-center relative`}
      style={{
        animationDuration: duration ? `${duration}ms` : '0ms',
      }}
    >
      <span>{msg}</span>
      {onClose && (
        <button
          className='absolute top-2 right-2 text-lg font-semibold'
          onClick={handleClose}
        >
          ✖
        </button>
      )}
    </div>
  );
};
