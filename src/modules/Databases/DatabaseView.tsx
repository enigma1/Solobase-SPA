import { useNavigate, useLocation } from 'react-router-dom';
import { SquareActivityIcon } from 'lucide-react';

import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { routes } from '>/config';
import { aStub } from '>/services/utils';
import { useErrorDialog } from '>/services/hooks';
import {
  queryKeys,
  useCreateDatabaseMutation,
  useDatabaseServerInfo,
} from '>/services/queryHooks';
import {
  useMessageStore,
  useDialogStore,
  useAccountStore,
} from '>/services/stores';
import { dbApi, CreateDatabaseRequest } from '>/services/api';
import { Message, MessageContent } from '>/types';
import {
  FormTextField,
  DialogRenderer,
  ScreenLoader,
  CustomSelect,
} from '>/modules';
import { queryClient } from '</src/config/reactQuery';
import { useEffect } from 'react';

export const DatabaseView = () => {
  const { addMessage } = useMessageStore(({ api }) => ({
    addMessage: api.addMessage,
  }));

  const { dbSelected } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
  }));

  const { collationsByCharset, defaults, isLoading, isSuccess } =
    useDatabaseServerInfo(({ state, query }) => ({
      collationsByCharset: state.collationsByCharset,
      defaults: state.defaults,
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
    }));

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
    setValues,
    formState: { errors },
  } = useForm<CreateDatabaseRequest>({
    defaultValues: {
      name: undefined,
      charset: undefined,
      collation: undefined,
    },
    mode: 'onChange',
  });

  const callbacks = {
    onSuccess: (data: any) => {
      console.log('Create database response', data);
      if (data?.success) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.databases(),
          exact: true,
        });
      }
      addMessage({
        type: 'success',
        mode: 'header',
        content: { text: 'Database created successfully', duration: 3000 },
        id: crypto.randomUUID(),
      } satisfies Message<MessageContent>);
    },
    onError: (error: any) => {
      console.error('Create database failed', error);
      addMessage({
        type: 'error',
        mode: 'header',
        content: { text: 'Failed to create database', duration: 3000 },
        id: crypto.randomUUID(),
      } satisfies Message<MessageContent>);
    },
  };

  const { mutate, isPending, response } = useCreateDatabaseMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    callbacks,
  );

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.databaseServerInfo(),
      exact: true,
    });
  }, []);

  const onSetDefaults = () => {
    setValues({
      charset: defaults.charset,
      collation: defaults.collation,
    });
    clearErrors();
  };

  const onDbSubmit = async (data: CreateDatabaseRequest) => {
    console.log('Submitting form with data:', data);
    mutate(data);
  };

  const dbCharsets = Object.keys(collationsByCharset);
  const values = getValues();
  console.log('Form values on submit:', defaults, values);

  return (
    <>
      {isSuccess && (
        <div className='page-container'>
          <div className='page-toolbar'>
            <h1 className='page-title'>Database</h1>
            <div className='page-actions'>
              <button
                className='btn-secondary'
                onClick={onSetDefaults}
                title='Set Defaults'
              >
                <SquareActivityIcon size={24} />
              </button>
            </div>
          </div>
          <div className='page-content'>
            <h2 className='text-lg'>Create New Database</h2>

            <form
              className='space-y-4'
              onSubmit={handleSubmit(onDbSubmit)}
              onClick={() => clearErrors()}
            >
              <div className='space-y-1'>
                <FormTextField
                  name='name'
                  label='Database Name'
                  control={control}
                  placeholder='Enter database name'
                  rules={{
                    required: 'database name is required',
                    minLength: { value: 2, message: 'min 2 characters' },
                    maxLength: { value: 64, message: 'max 64 characters' },
                    validate: (value) =>
                      /^[a-zA-Z0-9_-]+$/.test(value) ||
                      'only letters, numbers, _ and - are allowed',
                  }}
                />
              </div>
              <div className='space-y-1'>
                <label className='form-label'>Charset</label>
                <Controller
                  name='charset'
                  defaultValue={defaults.charset}
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      $options={dbCharsets.map((cs) => ({
                        value: cs,
                        label: cs,
                      }))}
                      $placeholder='Select Charset'
                    />
                  )}
                />
              </div>
              <div className='space-y-1'>
                <label className='form-label'>Collation</label>
                <Controller
                  defaultValue={defaults.collation}
                  name='collation'
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      $options={
                        collationsByCharset[
                          values.charset ?? defaults.charset
                        ]?.collations.map((collation) => ({
                          value: collation,
                          label: collation,
                        })) ?? []
                      }
                      $placeholder='Select Collation'
                    />
                  )}
                />
              </div>
              <div className='btn-group'>
                <button type='submit' className='btn'>
                  Create Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isLoading && <ScreenLoader />}
    </>
  );
};
