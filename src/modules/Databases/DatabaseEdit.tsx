import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, useEditDatabaseMutation } from '>/services/queryHooks';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { EditDatabaseRequest } from '>/services/api';
import { ScreenLoader } from '>/modules';
import { DatabaseForm } from './DatabaseForm';
import { DatabaseShape, ComponentFormHandlers } from '>/types';

type DatabaseEditProps = DatabaseShape & ComponentFormHandlers;
export const DatabaseEdit = ({
  name,
  charset,
  collation,
  formHandlers,
}: DatabaseEditProps) => {
  const queryClient = useQueryClient();

  const editDatabaseCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Database changed successfully', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not change database fields',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to change database', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useEditDatabaseMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    editDatabaseCallbacks,
  );

  const onDbSubmit = async (values: DatabaseShape) => {
    mutate({
      name,
      charset: values.charset,
      collation: values.collation,
    });
  };

  const isBusy = isPending;
  if (isBusy) return <ScreenLoader />;
  return (
    <DatabaseForm
      mode='edit'
      formHandlers={formHandlers}
      initialValues={{ name, collation, charset }}
      onSubmit={onDbSubmit}
    />
  );
};
