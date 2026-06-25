import { useEffect } from 'react';
import { useWatch, UseFormReturn, Controller } from 'react-hook-form';
import { SquareActivityIcon } from 'lucide-react';
import { FormTextField, ComboBox, FormComboField } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { StorageEngineMeta } from '>/services/api';
import { TableFormShape } from './tableDefs';

type TableBasicsFormProps = {
  mode: 'create' | 'edit';
  form: UseFormReturn<TableFormShape>;
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
  mode,
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
    getValues,
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
      table: getValues('table'),
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
          <h1 className='area-title'>
            {mode === 'create'
              ? 'Create Table Basics'
              : `Editing ${getValues('table')}`}
          </h1>
          <div className='area-actions'>
            <button
              type='button'
              className='btn-secondary'
              onClick={onSetDefaults}
              title='Set Server Defaults'
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
          <FormComboField
            id='table-charset'
            name='charset'
            label='Charset'
            control={control}
            $options={dbCharsets.map((c) => ({
              value: c,
              label: c,
            }))}
            $placeholder='Select Character Set'
          />
          <FormComboField
            id='table-collation'
            name='collation'
            label='Collation'
            control={control}
            rules={{
              validate: (value) =>
                value === undefined ||
                validCollations.includes(value) ||
                'Invalid collation',
            }}
            $options={validCollations.map((c) => ({
              value: c,
              label: c,
            }))}
            $placeholder='Select Table Collation'
          />
          <FormComboField
            id='table-engine'
            name='engine'
            label='Engine'
            control={control}
            $options={engines.map((e) => ({
              value: e.name,
              label: e.name,
            }))}
            $placeholder='Select Table Engine'
          />
        </div>
      </div>
    </>
  );
};
