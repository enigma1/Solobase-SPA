import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useCreateUserMutation } from '>/services/queryHooks';
import { messageStoreActions } from '>/services/stores';
import { ScreenLoader } from '>/modules';
import { WizardHandlers, UserShape } from '>/types';
import { UserForm } from './UserForm';
import { KEEP_EXISTING_PROFILE } from './Form';

type UserEditProps = {
  wizardHandlers: WizardHandlers;
  user: string;
  host: string;
};

export const UserEdit = ({ wizardHandlers, user, host }: UserEditProps) => {
  const queryClient = useQueryClient();
  const editUserCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users(),
          exact: true,
        });
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: `User successfully updated`, duration: 5000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not update user',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to update user', duration: 5000 },
      });
    },
  };

  const { mutate, isPending, response } = useCreateUserMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    editUserCallbacks,
  );

  const handleSubmit = (data: UserShape) => {
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
      mode='edit'
      onSubmit={handleSubmit}
      wizardHandlers={wizardHandlers}
      initialValues={{
        user,
        host,
        profile: KEEP_EXISTING_PROFILE,
      }}
    />
  );
};
