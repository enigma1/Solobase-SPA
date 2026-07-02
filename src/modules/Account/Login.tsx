import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  messageStoreActions,
  accountStoreActions,
  configStoreActions,
} from '>/services/stores';
import { useLoginMutation } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import {
  FormTextField,
  FormPasswordField,
  ComboField,
  ScreenLoader,
} from '>/modules';
import type { LoginRequest, LoginResponse } from '>/services/api';
import { CommonDialogHandlers } from '>/types';

type LoginFormRequest = LoginRequest & { backend: string };
type LoginProps = {
  formHandlers: CommonDialogHandlers;
};

export const Login = ({ formHandlers }: LoginProps) => {
  const queryClient = useQueryClient();
  const { setButtonStatus } = useModal();
  // const navigate = useNavigate();
  // const location = useLocation();

  const backend = configStoreActions.getBackend();

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { isValid, errors },
  } = useForm<LoginFormRequest>({
    defaultValues: { username: '', password: '', backend },
    mode: 'onChange',
  });

  useEffect(() => {
    setButtonStatus('confirm', isValid ? undefined : 'disabled');
  }, [isValid]);

  const callbacks = {
    onSuccess: (data: LoginResponse) => {
      configStoreActions.setBackend(getValues('backend'));
      const username = getValues('username');
      accountStoreActions.setAuthenticated(true);
      queryClient.clear();

      messageStoreActions.addMessage({
        type: 'success',
        content: {
          text: `Welcome back ${username}`,
          duration: 5000,
        },
      });
    },
    onError: () => {
      console.log('callback-error');
      messageStoreActions.addMessage({
        content: {
          text: 'Login failed. Please check endpoint and your credentials and try again.',
          duration: 8000,
        },
      });
    },
  };

  const { mutate, isPending, response } = useLoginMutation(
    ({ api, query, state }) => ({
      mutate: api.mutate,
      isPending: query.isPending,
      response: state,
    }),
    callbacks,
  );

  const onLoginSubmit = (data: LoginFormRequest) => {
    configStoreActions.setBackend(data.backend);
    const request = {
      username: data.username,
      password: data.password,
    };
    mutate(request);
  };

  useEffect(() => {
    formHandlers.confirm = handleSubmit(onLoginSubmit);
  }, [onLoginSubmit, handleSubmit]);

  const isBusy = isPending;

  if (isBusy) {
    return <ScreenLoader />;
  }

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Database Connect</h1>
        <div className='area-actions'></div>
      </div>
      <div className='area-content'>
        <h2 className='text-lg'>Login</h2>
        <form
          className='space-y-4'
          onSubmit={handleSubmit(onLoginSubmit)}
          onClick={() => clearErrors()}
        >
          <div className='space-y-1'>
            <FormTextField
              id='login-username'
              name='username'
              label='Username:'
              control={control}
              rules={{
                required: 'username required',
                validate: {
                  moreThanOne: (v) =>
                    v.length > 1 || 'username must be at least 2 characters',
                },
              }}
            />
          </div>
          <div className='space-y-1'>
            <FormPasswordField
              id='login-pass'
              name='password'
              label='Password:'
              control={control}
            />
          </div>
          <div className='space-y-1'>
            <FormTextField
              id='back-end'
              name='backend'
              label='Back End URL:'
              control={control}
            />
          </div>

          <div className='btn-group'>
            {/* <button type='submit' className='btn'>
              User Login
            </button> */}

            {/* <button
                type='button'
                onClick={() => navigate(routes.front.createUser)}
                className='btn-secondary'
              >
                Register
              </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};
