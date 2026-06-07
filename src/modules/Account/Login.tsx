// import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { messageStoreActions, useAccountStore } from '>/services/stores';
import { LoginRequest, LoginResponse } from '>/services/api';
import { FormTextField, FormPasswordField, ScreenLoader } from '>/modules';
import { useLoginMutation } from '</src/services/queryHooks/useWriteHooks';

export const Login = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  const { username } = useAccountStore(({ state }) => ({
    username: state.username,
  }));

  const callbacks = {
    onSuccess: (data: LoginResponse) => {
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

  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: { username: '', password: '' },
    mode: 'onChange',
  });

  const onLoginSubmit = (data: LoginRequest) => {
    mutate(data);
  };

  const isBusy = isPending;

  if (isBusy) {
    return <ScreenLoader />;
  }

  return (
    <div className='page-container'>
      <div className='page-toolbar'>
        <h1 className='page-title'>Database Connect</h1>
        <div className='page-actions'></div>
      </div>
      <div className='page-content'>
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
            <button type='submit' className='btn'>
              User Login
            </button>

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
