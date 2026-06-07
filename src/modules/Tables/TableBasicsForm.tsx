import { useEffect } from 'react';
import { useWatch, UseFormReturn, Controller } from 'react-hook-form';
import { SquareActivityIcon } from 'lucide-react';
import { FormTextField, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { TableShape } from '>/types';
import { StorageEngineMeta } from '>/services/api';

type TableBasicsFormProps = {
  form: UseFormReturn<TableShape>;
  dbCharsets: string[];
  collationsByCharset: Record<string, { collations: string[] }>;
  engines: StorageEngineMeta[];
  defaults: {
    charset: string;
    collation: string;
    engine: string;
  };
  onValidation: (valid: boolean) => void;
};

export const TableBasicsForm = ({
  form,
  dbCharsets,
  collationsByCharset,
  engines,
  defaults,
  onValidation,
}: TableBasicsFormProps) => {
  const {
    control,
    watch,
    setValues,
    clearErrors,
    formState: { errors },
  } = form;

  const values = useWatch({
    control,
    name: ['table', 'engine', 'charset', 'collation'],
  });

  const charset = watch('charset') ?? defaults.charset;
  const validCollations = collationsByCharset[charset]?.collations ?? [];

  useEffect(() => {
    const valid =
      values.every(Boolean) &&
      !errors.table &&
      !errors.engine &&
      !errors.charset &&
      !errors.collation;

    onValidation(valid);
  }, [values, errors]);

  const onSetDefaults = () => {
    setValues({
      charset: defaults.charset,
      collation: defaults.collation,
      engine: defaults.engine,
    });
    clearErrors();
  };

  return (
    <>
      <div className='area-container'>
        <div className='area-spacer'>
          <h1 className='area-title'>Create Table Basics</h1>
          <div className='area-actions'>
            <button
              type='button'
              className='btn-secondary'
              onClick={onSetDefaults}
              title='Set Defaults'
            >
              <SquareActivityIcon size={24} />
            </button>
          </div>
        </div>
        <div className='area-content'>
          <FormTextField
            id='table-name'
            name='table'
            label='Table Name:'
            control={control}
            rules={{
              required: 'A table name is required',
              minLength: { value: 1, message: 'min 1 character' },
              maxLength: { value: 64, message: 'max 64 characters' },
              validate: {
                isString: (v) => typeof v === 'string' || 'Must be a string',
                noNullBytes: (v) =>
                  (typeof v === 'string' && !/\u0000/.test(v)) ||
                  'Invalid characters',
                noWhitespaceEdges: (v) =>
                  (typeof v === 'string' && !/^\s|\s$/.test(v)) ||
                  'No lead/trail spaces',
              },
            }}
          />
          <Controller
            name='charset'
            control={control}
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='Charset:'
                htmlFor='charset'
                $status={fieldState.error ? 'error' : undefined}
                $notice={fieldState.error?.message}
              >
                <ComboBox
                  id='charset'
                  value={field.value}
                  onChange={field.onChange}
                  $options={dbCharsets.map((c) => ({
                    value: c,
                    label: c,
                  }))}
                />
              </FormFieldWrapper>
            )}
          />
          <Controller
            name='collation'
            control={control}
            rules={{
              validate: (value) =>
                !value ||
                validCollations.includes(value) ||
                'Invalid collation',
            }}
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='Collation:'
                htmlFor='collation'
                $status={fieldState.error ? 'error' : undefined}
                $notice={fieldState.error?.message}
              >
                <ComboBox
                  id='collation'
                  value={field.value}
                  onChange={field.onChange}
                  $options={validCollations.map((c) => ({
                    value: c,
                    label: c,
                  }))}
                />
              </FormFieldWrapper>
            )}
          />
          <Controller
            name='engine'
            control={control}
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='Engine:'
                htmlFor='engine'
                $status={fieldState.error ? 'error' : undefined}
                $notice={fieldState.error?.message}
              >
                <ComboBox
                  id='engine'
                  value={field.value}
                  onChange={field.onChange}
                  $options={engines.map((e) => ({
                    value: e.name,
                    label: e.name,
                  }))}
                />
              </FormFieldWrapper>
            )}
          />
        </div>
      </div>
    </>
  );
};
