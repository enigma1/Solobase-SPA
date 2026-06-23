import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useCreateUserMutation } from '>/services/queryHooks';
import { messageStoreActions } from '>/services/stores';
import { ScreenLoader } from '>/modules';
import { UserForm } from './UserForm';
import { WizardHandlers, UserShape } from '>/types';

type UserNewProps = {
  wizardHandlers: WizardHandlers;
};

export const UserNew = ({ wizardHandlers }: UserNewProps) => {
  const queryClient = useQueryClient();
  const createUserCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users(),
          exact: true,
        });
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

  const handleSubmit = (data: UserShape) => {
    console.log('create user', data);
    mutate(data);
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
        profile: '',
      }}
    />
  );
};
