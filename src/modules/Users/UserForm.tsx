import { useState, useEffect, useMemo } from 'react';
// import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useModal } from '>/services/hooks';
import { ButtonStatus, WizardHandlers } from '>/types';
import { UserBasics, UserReview, UserFormShape, UserFormProfile } from './Form';

type ButtonsGroupState = Partial<Record<string, ButtonStatus>>;
type UserFormStep = 'basics' | 'review';
const stepOrder: UserFormStep[] = ['basics', 'review'];

type UserFormProps = {
  initialValues?: {
    user?: string;
    host?: string;
    password?: string;
    profile?: UserFormProfile;
  };
  onSubmit: (data: UserFormShape) => void;
  wizardHandlers: WizardHandlers;
  mode?: 'create' | 'edit';
};

export const UserForm = ({
  initialValues = {},
  onSubmit,
  wizardHandlers,
  mode = 'create',
}: UserFormProps) => {
  const [step, setStep] = useState<UserFormStep>('basics');
  const nextStep = (current: UserFormStep): UserFormStep => {
    const idx = stepOrder.indexOf(current);
    return stepOrder[Math.min(idx + 1, stepOrder.length - 1)];
  };
  const prevStep = (current: UserFormStep): UserFormStep => {
    const idx = stepOrder.indexOf(current);
    return stepOrder[Math.max(idx - 1, 0)];
  };

  // const queryClient = useQueryClient();

  // const { user, host, isFetching, isSuccess } = useUserInfo(
  //   ({ state, query }) => ({
  //     user: state.user,
  //     host: state.host,
  //     defaults: state.defaults,
  //     isFetching: query.isFetching,
  //     isSuccess: query.isSuccess,
  //     isError: query.isError,
  //   }),
  // );

  const form = useForm<UserFormShape>({
    defaultValues: {
      ...initialValues,
      user: initialValues.user ?? '',
      host: initialValues.host ?? '',
      password: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { handleSubmit, getValues } = form;

  const goPrevStep = () => {
    const prev = prevStep(step);
    setStep(prev);
    updateButtons(prev, true);
  };

  const goNextStep = () => {
    const next = nextStep(step);
    setStep(next);
    updateButtons(next, false);
  };

  useEffect(() => {
    wizardHandlers.next = goNextStep;
    wizardHandlers.previous = goPrevStep;
    wizardHandlers.finish = async () =>
      await handleSubmit((values) => onSubmit({ ...values }))();

    return () => {
      wizardHandlers.next = undefined;
      wizardHandlers.previous = undefined;
      wizardHandlers.finish = undefined;
    };
  }, [step]);

  // useEffect(() => {
  //   queryClient.invalidateQueries({
  //     queryKey: queryKeys.users(),
  //     exact: true,
  //   });
  // }, []);

  const { setButtonsStatuses } = useModal();
  const updateButtons = (step: UserFormStep, valid: boolean) => {
    const isFirstStep = step === stepOrder[0];
    const isLastStep = step === stepOrder[stepOrder.length - 1];

    const buttonsState: ButtonsGroupState = {
      previous: !isFirstStep ? undefined : 'hidden',
      next: isLastStep ? 'hidden' : valid ? undefined : 'disabled',
      finish: isLastStep ? undefined : 'hidden',
    };
    setButtonsStatuses(buttonsState);
  };

  const onValidation = (valid: boolean) => updateButtons(step, valid);

  return (
    <form className='dialog-form'>
      {step === 'basics' && (
        <UserBasics
          mode={mode}
          onValidation={onValidation}
          form={form}
          defaults={getValues()}
        />
      )}
      {step === 'review' && (
        <UserReview mode={mode} onValidation={onValidation} form={form} />
      )}
    </form>
  );
};
