import { useEffect, useMemo } from 'react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import { SquareActivityIcon } from 'lucide-react';
import { FormTextField, FormComboField, FormPasswordField } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import {
  KEEP_EXISTING_PROFILE,
  UserFormMode,
  UserFormShape,
  UserFormProfile,
  profileOptions,
} from './userProfiles';

type UserBasicsProps = {
  mode: UserFormMode;
  form: UseFormReturn<UserFormShape>;
  defaults: {
    user: string;
    host: string;
    password: string;
    profile?: UserFormProfile;
  };
  onValidation: (valid: boolean) => void;
};

export const UserBasics = ({
  mode,
  form,
  defaults,
  onValidation,
}: UserBasicsProps) => {
  const {
    control,
    watch,
    setValues,
    getValues,
    clearErrors,
    formState: { errors },
  } = form;

  const namesToWatch = ['profile', 'user', 'host', 'password'] as const;
  const values = useWatch({
    control,
    name: namesToWatch,
  });

  useEffect(() => {
    const requiredFields = new Set(['profile', 'user', 'host']);

    const hasValues = namesToWatch.every((name, idx) => {
      if (!requiredFields.has(name)) {
        return true;
      }

      return !!values[idx];
    });

    const hasErrors =
      !!errors.user || !!errors.host || !!errors.password || !!errors.profile;

    onValidation(hasValues && !hasErrors);
  }, [values, errors]);

  const validProfiles = useMemo(() => {
    const keys = Object.keys(profileOptions) as UserFormProfile[];

    return keys
      .filter((key) =>
        mode === 'create' ? key !== KEEP_EXISTING_PROFILE : true,
      )
      .map((key) => ({
        value: key,
        label: profileOptions[key].label,
      }));
  }, [mode]);

  const onSetDefaults = () => {
    setValues({
      user: defaults.user,
      host: defaults.host,
      password: defaults.password,
      profile: defaults.profile,
    });
    clearErrors();
  };

  return (
    <>
      <div className='area-container'>
        <div className='area-spacer'>
          <h1 className='area-title'>
            {mode === 'create' ? 'Create Table Basics' : `Editing ${values[0]}`}
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
            id='username'
            name='user'
            label='User name:'
            control={control}
            rules={{
              required: 'Username is required',
              minLength: { value: 2, message: 'min 2 character' },
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
          <FormTextField
            id='hostname'
            name='host'
            label='Host name:'
            control={control}
            rules={{
              required: 'Host name is required',
              minLength: { value: 1, message: 'min 1 character' },
              maxLength: { value: 256, message: 'max 256 characters' },
              validate: {
                isString: (v) => typeof v === 'string' || 'Must be a string',
                noNullBytes: (v) =>
                  (typeof v === 'string' && !/\u0000/.test(v)) ||
                  'Invalid characters',
                noWhitespaceEdges: (v) =>
                  (typeof v === 'string' && !/^\s|\s$/.test(v)) ||
                  'No leading/trailing spaces',
                validHostChars: (v) =>
                  (typeof v === 'string' && /^[a-zA-Z0-9.*%_-]+$/.test(v)) ||
                  'Invalid host format',
              },
            }}
          />
          <FormPasswordField
            id='password'
            name='password'
            label='Password:'
            control={control}
            rules={{
              validate: {
                limits: (v) => {
                  if (v && v.length > 256) {
                    return 'Password must be at most 256 characters';
                  }
                  return true;
                },
              },
            }}
          />
          <FormComboField
            id='user-profile'
            name='profile'
            label='User Profile'
            control={control}
            rules={{
              required: 'Profile is required',
            }}
            $options={validProfiles ?? []}
            $placeholder='Select Profile'
          />
        </div>
      </div>
    </>
  );
};
