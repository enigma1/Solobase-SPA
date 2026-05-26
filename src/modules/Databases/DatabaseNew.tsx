import { useNavigate, useLocation } from 'react-router-dom';
import { SquareActivityIcon } from 'lucide-react';

import { useForm, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { routes } from '>/config';
import { aStub } from '>/services/utils';
import { useErrorDialog } from '>/services/hooks';
import {
  queryKeys,
  useCreateDatabaseMutation,
  useDatabaseServerInfo,
} from '>/services/queryHooks';
import {
  messageStoreActions,
  useDialogStore,
  useAccountStore,
} from '>/services/stores';
import { dbApi, CreateDatabaseRequest } from '>/services/api';
import {
  FormTextField,
  DialogRenderer,
  ScreenLoader,
  ComboBox,
} from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { queryClient } from '>/config/reactQuery';
import { useEffect } from 'react';

export const DatabaseNew = () => {
  // const { dbSelected } = useAccountStore(({ state }) => ({
  //   dbSelected: state.dbSelected,
  // }));

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
    setValue,
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
      if (data?.success) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.databases(),
          exact: true,
        });
      }
      messageStoreActions.addMessage({
        type: 'success',
        content: { text: 'Database created successfully', duration: 3000 },
      });
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
    callbacks,
  );

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.databaseServerInfo(),
      exact: true,
    });
  }, []);

  const charset = useWatch({
    control,
    name: 'charset',
  });

  const validCollations = collationsByCharset[charset]?.collations ?? [];

  useEffect(() => {
    const current = getValues('collation');

    if (!validCollations.includes(current)) {
      setValue('collation', '');
    }
  }, [charset]);

  const onSetDefaults = () => {
    setValues({
      charset: defaults.charset,
      collation: defaults.collation,
    });
    clearErrors();
  };

  const onDbSubmit = async (data: CreateDatabaseRequest) => {
    mutate(data);
  };

  const dbCharsets = Object.keys(collationsByCharset);
  const values = getValues();

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
                  id='create-database-name'
                  name='name'
                  label='Database Name:'
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
                <Controller
                  name='charset'
                  defaultValue={defaults.charset}
                  control={control}
                  rules={{
                    required: 'charset is required',
                  }}
                  render={({ field, fieldState }) => (
                    <FormFieldWrapper
                      label='Charset:'
                      htmlFor='create-database-charset'
                      $status={fieldState.error ? 'error' : undefined}
                      $notice={fieldState.error?.message}
                    >
                      <ComboBox
                        id='create-database-charset'
                        $editable={true}
                        value={field.value}
                        onChange={field.onChange}
                        $options={dbCharsets.map((cs) => ({
                          value: cs,
                          label: cs,
                        }))}
                        $placeholder='Select Charset'
                        $status={!!fieldState.error ? 'error' : undefined}
                      />
                    </FormFieldWrapper>
                  )}
                />
              </div>
              <div className='space-y-1'>
                <Controller
                  defaultValue={defaults.collation}
                  name='collation'
                  control={control}
                  rules={{
                    required: 'collation is required',
                    validate: (value) => {
                      const charset = getValues('charset');
                      const valid =
                        collationsByCharset?.[charset]?.collations ?? [];
                      return valid.includes(value) || 'Invalid collation';
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <FormFieldWrapper
                      label='Collation:'
                      htmlFor='create-database-collation'
                      $status={fieldState.error ? 'error' : undefined}
                      $notice={fieldState.error?.message}
                    >
                      <ComboBox
                        id='create-database-collation'
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
                        $status={!!fieldState.error ? 'error' : undefined}
                      />
                    </FormFieldWrapper>
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
