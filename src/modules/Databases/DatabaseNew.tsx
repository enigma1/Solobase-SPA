import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, FieldErrors, useWatch } from 'react-hook-form';
import {
  queryKeys,
  useCreateDatabaseMutation,
  useDatabaseServerInfo,
} from '>/services/queryHooks';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { dbApi, CreateDatabaseRequest } from '>/services/api';
import { FormTextField, ScreenLoader, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { DatabaseForm } from './DatabaseForm';
import { DatabaseShape, ComponentFormHandlers } from '>/types';

export const DatabaseNew = (props: ComponentFormHandlers) => {
  const queryClient = useQueryClient();

  const createDatabaseCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.databases(),
          exact: true,
        });
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Database created successfully', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not create database',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to create database', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useCreateDatabaseMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    createDatabaseCallbacks,
  );

  const onSubmit = async (values: DatabaseShape) => {
    mutate({
      name: values.name,
      charset: values.charset,
      collation: values.collation,
    });
  };

  const isBusy = isPending;

  if (isBusy) return <ScreenLoader />;
  return (
    <DatabaseForm
      {...props}
      mode='create'
      initialValues={{ name: '', collation: '', charset: '' }}
      onSubmit={onSubmit}
    />
  );
};
