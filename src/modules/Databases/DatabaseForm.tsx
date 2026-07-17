import { useEffect } from 'react';
import { SquareActivityIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useDatabaseServerInfo } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import { FormTextField, ScreenLoader, FormComboField } from '>/modules';
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

  const [charset = defaults.charset, collation] = useWatch({
    control,
    name: ['charset', 'collation'],
  });
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
  const isComplete = (!!charset && !!collation) || (!charset && !collation);
  useEffect(() => {
    setButtonStatus('confirm', isValid && isComplete ? undefined : 'disabled');
  }, [isValid, charset, collation]);

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
            <FormComboField
              id='create-database-charset'
              label='Charset:'
              name='charset'
              control={control}
              $options={dbCharsets.map((cs) => ({
                value: cs,
                label: cs,
              }))}
              $placeholder='Select Charset'
              $status={errors.charset ? 'error' : undefined}
              $notice={errors.charset?.message}
            />
          </div>
          <div className='space-y-1'>
            <FormComboField
              id='create-database-collation'
              label='Collation:'
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
              $options={
                collationsByCharset[
                  values.charset ?? defaults.charset
                ]?.collations.map((collation) => ({
                  value: collation,
                  label: collation,
                })) ?? []
              }
              $placeholder='Select Collation'
              $status={!isComplete ? 'warn' : undefined}
              $notice={
                !isComplete
                  ? 'Note: Selecting a charset requires a valid collation'
                  : undefined
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
};
