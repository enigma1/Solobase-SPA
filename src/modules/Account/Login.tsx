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

type LoginFormRequest = LoginRequest & { backport: number };
type LoginProps = {
  formHandlers: CommonDialogHandlers;
};

export const Login = ({ formHandlers }: LoginProps) => {
  const queryClient = useQueryClient();
  const { setButtonStatus } = useModal();
  // const navigate = useNavigate();
  // const location = useLocation();

  const backport = configStoreActions.getBackport();

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { isValid, errors },
  } = useForm<LoginFormRequest>({
    defaultValues: { username: '', password: '', backport },
    mode: 'onChange',
  });

  useEffect(() => {
    setButtonStatus('confirm', isValid ? undefined : 'disabled');
  }, [isValid]);

  const callbacks = {
    onSuccess: (data: LoginResponse) => {
      const username = getValues('username');
      queryClient.clear();
      // queryClient.removeQueries();

      configStoreActions.setBackport(getValues('backport'));
      accountStoreActions.batch(() => {
        accountStoreActions.setCapabilities(data.capabilities);
        accountStoreActions.setUsername(username);
        accountStoreActions.setAuthenticated(true);
      });
      messageStoreActions.addMessage({
        type: 'success',
        content: {
          text: `Welcome back ${username}`,
          duration: 5000,
        },
      });
    },
    onError: () => {
      messageStoreActions.addMessage({
        content: {
          text: 'Login failed. Please check endpoint and your credentials and try again.',
          duration: 8000,
        },
      });
    },
  };

  const { mutateAsync, isPending, response } = useLoginMutation(
    ({ api, query, state }) => ({
      mutateAsync: api.mutateAsync,
      isPending: query.isPending,
      response: state,
    }),
    callbacks,
  );

  const onLoginSubmit = async (data: LoginFormRequest) => {
    configStoreActions.setBackport(data.backport);
    const request = {
      username: data.username,
      password: data.password,
    };
    await mutateAsync(request);
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleSubmit(onLoginSubmit)();
            }
          }}
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
              name='backport'
              label='Back End Port:'
              control={control}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
