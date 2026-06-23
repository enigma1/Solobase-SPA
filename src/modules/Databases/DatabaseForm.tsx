import { useEffect } from 'react';
import { SquareActivityIcon } from 'lucide-react';
import { useForm, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { useDatabaseServerInfo } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { FormTextField, ScreenLoader, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { DatabaseShape, ComponentFormHandlers } from '>/types';

type DatabaseFormProps = ComponentFormHandlers & {
  mode: 'create' | 'edit';
  initialValues: {
    name?: string;
    charset?: string;
    collation?: string;
  };
  onSubmit: (data: DatabaseShape) => void;
};

export const DatabaseForm = ({
  mode,
  initialValues,
  onSubmit,
  formHandlers,
}: DatabaseFormProps) => {
  const { setButtonStatus } = useModal();
  const { collationsByCharset, defaults, isLoading } = useDatabaseServerInfo(
    ({ state, query }) => ({
      collationsByCharset: state.collationsByCharset,
      defaults: state.defaults,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isLoading: query.isLoading,
    }),
  );

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
    setValues,
    setValue,
    formState: { isValid, errors },
  } = useForm<DatabaseShape>({
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const charset =
    useWatch({
      control,
      name: 'charset',
    }) ?? defaults.charset;

  const validCollations = collationsByCharset[charset]?.collations ?? [];

  useEffect(() => {
    const current = getValues('collation') ?? defaults.collation;

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
  const dbCharsets = Object.keys(collationsByCharset);
  const values = getValues();

  useEffect(() => {
    setButtonStatus('confirm', isValid ? undefined : 'disabled');
  }, [isValid]);

  useEffect(() => {
    formHandlers.confirm = handleSubmit(onSubmit);
  }, [onSubmit, handleSubmit]);

  const isBusy = isLoading;
  if (isBusy) return <ScreenLoader />;

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>
          {mode === 'create'
            ? 'Create New Database'
            : `Editing Database ${initialValues.name}`}
        </h1>
        <div className='area-actions'>
          <button
            className='btn-secondary'
            onClick={onSetDefaults}
            title='Set Defaults'
          >
            <SquareActivityIcon size={24} />
          </button>
        </div>
      </div>
      <div className='area-content'>
        <form
          className='space-y-4'
          onSubmit={handleSubmit(onSubmit)}
          onClick={() => clearErrors()}
        >
          {mode === 'create' && (
            <div className='space-y-1'>
              <FormTextField
                id='create-database-name'
                name='name'
                label='Database Name:'
                control={control}
                placeholder='Enter database name'
                rules={{
                  required: 'database name is required',
                  minLength: { value: 1, message: 'min 1 characters' },
                  maxLength: { value: 64, message: 'max 64 characters' },
                  validate: (value) =>
                    /^[a-zA-Z0-9_-]+$/.test(value ?? '') ||
                    'only letters, numbers, _ and - are allowed',
                }}
              />
            </div>
          )}
          <div className='space-y-1'>
            <Controller
              name='charset'
              // defaultValue={defaults.charset}
              control={control}
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
              // defaultValue={defaults.collation}
              name='collation'
              control={control}
              rules={{
                // required: 'collation is required',
                validate: (value) => {
                  if (!value) return true;
                  const charset = getValues('charset');
                  if (!charset) return true;
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
        </form>
      </div>
    </div>
  );
};
