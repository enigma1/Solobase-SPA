import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { messageStoreActions, accountStoreActions } from '>/services/stores';
import { useLoginMutation } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import { FormTextField, FormPasswordField, ScreenLoader } from '>/modules';
import type { LoginRequest, LoginResponse } from '>/services/api';
import { CommonDialogHandlers } from '>/types';

type LoginProps = {
  formHandlers: CommonDialogHandlers;
};

export const Login = ({ formHandlers }: LoginProps) => {
  const queryClient = useQueryClient();
  const { setButtonStatus } = useModal();
  // const navigate = useNavigate();
  // const location = useLocation();

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { isValid, errors },
  } = useForm<LoginRequest>({
    defaultValues: { username: '', password: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    setButtonStatus('confirm', isValid ? undefined : 'disabled');
  }, [isValid]);

  const callbacks = {
    onSuccess: (data: LoginResponse) => {
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
      messageStoreActions.addMessage({
        content: {
          text: 'Login failed. Please check your credentials and try again.',
          duration: 3000,
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

  const onLoginSubmit = (data: LoginRequest) => {
    mutate(data);
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
              label='Username'
              control={control}
              rules={{
                required: 'username required',
                validate: {
                  moreThanOne: (v) =>
                    v.length > 2 || 'username must be at least 2 characters',
                },
              }}
            />
          </div>
          <div className='space-y-1'>
            <FormPasswordField
              id='login-pass'
              name='password'
              label='Password'
              control={control}
              rules={{
                validate: {
                  moreThanOne: (v) =>
                    v.length > 0 && v.length < 8
                      ? 'invalid password'
                      : undefined,
                },
              }}
            />
          </div>
          <div className='btn-group'>
            {/* <button type='submit' className='btn'>
              User Login
            </button> */}

            {/* <button
                type='button'
                onClick={() => navigate(routes.front.newUser)}
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
