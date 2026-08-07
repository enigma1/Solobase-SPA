import { useNavigate, Link, LinkProps } from 'react-router-dom';
import { accountStoreActions } from '>/services/stores';

export const GuardedLink = ({ to, children, ...props }: LinkProps) => {
  const navigate = useNavigate();

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const allowed = await accountStoreActions.triggerGuard();

    if (allowed) {
      navigate(to);
    }
  };

  return (
    <Link {...props} to={to} onClick={handleClick}>
      {children}
    </Link>
  );
};
