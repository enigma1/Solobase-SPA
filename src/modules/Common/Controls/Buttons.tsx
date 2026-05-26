import { Link, type LinkProps } from 'react-router-dom';
import { motion, type HTMLMotionProps } from 'motion/react';
const BaseMotionButton = motion.create('button');
const BaseMotionLink = motion.create(Link);
const baseTap = { scale: 0.97 };
const baseTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
} as const;

export const PressableLink = (
  props: React.ComponentProps<typeof BaseMotionLink>,
) => (
  <BaseMotionLink whileTap={baseTap} transition={baseTransition} {...props} />
);

type PressableButtonProps = HTMLMotionProps<'button'>;
export const PressableButton = ({
  children,
  ...props
}: PressableButtonProps) => {
  return (
    <BaseMotionButton whileTap={baseTap} transition={baseTransition} {...props}>
      {children}
    </BaseMotionButton>
  );
};
