import { useState, useEffect, useMemo } from 'react';
import { SquareActivityIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { queryKeys, useDatabaseServerInfo } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import {
  FormTextField,
  ScreenLoader,
  ComboBox,
  DialogContent,
} from '>/modules';
import { emptyTableColumn } from '>/services/utils';
import { SqlColumns, ButtonStatus, TableShape, WizardHandlers } from '>/types';
import { TableBasicsForm } from './TableBasicsForm';
import { TableColumnsForm } from './TableColumnsForm';
import { TableKeysForm } from './TableKeysForm';
import { TableReview } from './TableReview';

type ButtonsGroupState = Partial<Record<string, ButtonStatus>>;
type TableFormStep = 'basics' | 'columns' | 'keys' | 'review';
const stepOrder: TableFormStep[] = ['basics', 'columns', 'keys', 'review'];

type TableFormProps = {
  initialValues: {
    table?: string;
    engine?: string;
    charset?: string;
    collation?: string;
    cols?: SqlColumns[];
    colsParams?: Record<string, string | number>[];
  };
  onSubmit: (data: TableShape) => void;
  wizardHandlers: WizardHandlers;
};

export const TableForm = ({
  initialValues,
  onSubmit,
  wizardHandlers,
}: TableFormProps) => {
  const [step, setStep] = useState<TableFormStep>('basics');
  const nextStep = (current: TableFormStep): TableFormStep => {
    const idx = stepOrder.indexOf(current);
    return stepOrder[Math.min(idx + 1, stepOrder.length - 1)];
  };
  const prevStep = (current: TableFormStep): TableFormStep => {
    const idx = stepOrder.indexOf(current);
    return stepOrder[Math.max(idx - 1, 0)];
  };

  const queryClient = useQueryClient();
  const { collationsByCharset, engines, defaults, isFetching, isSuccess } =
    useDatabaseServerInfo(({ state, query }) => ({
      collationsByCharset: state.collationsByCharset,
      engines: state.engines,
      defaults: state.defaults,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isError: query.isError,
    }));

  const form = useForm<TableShape>({
    defaultValues: {
      ...initialValues,
      charset: initialValues.charset ?? defaults.charset,
      engine: initialValues.engine ?? defaults.engine,
      collation: initialValues.collation ?? defaults.collation,
      cols: initialValues.cols ? initialValues.cols : [{ ...emptyTableColumn }],
      colsParams: initialValues.colsParams ?? [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { handleSubmit } = form;

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

  // const stepValues = useWatch({
  //   control,
  //   name: stepFields[step],
  // });

  // const isStepValid = stepFields[step].every((field) => {
  //   return !form.getFieldState(field).invalid;
  // });

  // useEffect(() => {
  //   const buttonsState: ButtonsGroupState = {
  //     previous: isFirstStep ? 'hidden' : undefined,
  //     next: isStepValid ? undefined : 'disabled',
  //     finish: isLastStep ? (isStepValid ? undefined : 'disabled') : 'hidden',
  //   };
  //   setButtonsStatuses(buttonsState);
  // }, [step, stepValues]);

  // useEffect(() => {
  //   const run = async () => {
  //     // const valid = await trigger(stepFields[step]);
  //     // setStepValidity((prev) => ({ ...prev, [step]: valid }));
  //   };

  //   run();
  // }, [step, stepValues]);

  useEffect(() => {
    wizardHandlers.next = goNextStep;
    wizardHandlers.previous = goPrevStep;
    wizardHandlers.finish = handleSubmit(onSubmit);

    return () => {
      wizardHandlers.next = undefined;
      wizardHandlers.previous = undefined;
      wizardHandlers.finish = undefined;
    };
  }, [step]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.databaseServerInfo(),
      exact: true,
    });
  }, []);

  const { setButtonsStatuses } = useModal();
  const updateButtons = (step: TableFormStep, valid: boolean) => {
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
  const dbCharsets = Object.keys(collationsByCharset);
  const isBusy = isFetching;
  if (isBusy) {
    return <ScreenLoader />;
  }

  if (!isSuccess) {
    return <DialogContent note='Could not retrieve server information' />;
  }

  return (
    <>
      <form
        className='space-y-4 flex flex-1 flex-col min-h-0'
        // onSubmit={handleSubmit(onSubmit)}
        // onClick={() => clearErrors()}
      >
        {step === 'basics' && (
          <TableBasicsForm
            onValidation={onValidation}
            form={form}
            engines={engines}
            dbCharsets={dbCharsets}
            collationsByCharset={collationsByCharset}
            defaults={{
              charset: defaults.charset,
              collation: defaults.collation,
              engine: defaults.engine,
            }}
          />
        )}
        {step === 'columns' && (
          <TableColumnsForm
            defaults={{
              column: {
                field: 'id',
                type: 'INT',
              },
            }}
            onValidation={onValidation}
            form={form}
          />
        )}
        {step === 'keys' && (
          <TableKeysForm onValidation={onValidation} form={form} />
        )}
        {step === 'review' && (
          <TableReview onValidation={onValidation} form={form} />
        )}
      </form>
    </>
  );
};
