import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateUserMutation } from '>/services/queryHooks';
import { messageStoreActions } from '>/services/stores';
import { ScreenLoader } from '>/modules';
import { UserForm } from './UserForm';
import type { WizardHandlers, UserShape } from '>/types';
import { routes } from '>/config';
import type { CreateUserResponse } from '>/services/api/dbApiTypes';
import { UserFormShape, KEEP_EXISTING_PROFILE } from './Form';

type UserNewProps = {
  wizardHandlers: WizardHandlers;
};

export const UserNew = ({ wizardHandlers }: UserNewProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const createUserCallbacks = {
    onSuccess: (data: CreateUserResponse) => {
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: `User successfully created`, duration: 5000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not create user',
            duration: 3000,
          },
        });
      }
      if (location.pathname !== routes.front.listUsers) {
        navigate(routes.front.listUsers);
        return;
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to create user', duration: 5000 },
      });
    },
  };

  const { mutate, isPending, response } = useCreateUserMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    createUserCallbacks,
  );

  const handleSubmit = (data: UserFormShape) => {
    const serverData = {
      ...data,
      profile:
        data.profile !== KEEP_EXISTING_PROFILE ? data.profile : undefined,
    };
    mutate(serverData);
  };

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;

  return (
    <UserForm
      mode='create'
      onSubmit={handleSubmit}
      wizardHandlers={wizardHandlers}
      initialValues={{
        user: '',
        host: '%',
      }}
    />
  );
};
