import { motion } from 'motion/react';

type SwitchProps = {
  checked: boolean;
  onChange: (val: boolean) => void;
};

export const Switch = ({ checked, onChange }: SwitchProps) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`w-12 h-6 rounded-full p-0.5 flex items-center cursor-pointer transition-colors
        ${checked ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}
      `}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className='w-5 h-5 rounded-full bg-white'
      />
    </div>
  );
};
