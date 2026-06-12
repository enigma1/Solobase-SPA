import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { queryKeys, useDatabaseServerInfo } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import { ScreenLoader, DialogContent } from '>/modules';
import { emptyTableColumn, emptyTableColumnKey } from '>/services/utils';
import {
  SqlColumns,
  ButtonStatus,
  TableShape,
  WizardHandlers,
  TableShapeColumn,
  TableShapeKey,
} from '>/types';
import { TableBasicsForm } from './TableBasicsForm';
import { TableColumnsForm } from './TableColumnsForm';
import { TableKeysForm } from './TableKeysForm';
import { TableReview } from './TableReviewForm';

type ButtonsGroupState = Partial<Record<string, ButtonStatus>>;
type TableFormStep = 'basics' | 'columns' | 'keys' | 'review';
const stepOrder: TableFormStep[] = ['basics', 'columns', 'keys', 'review'];

type TableFormProps = {
  initialValues?: {
    table?: string;
    engine?: string;
    charset?: string;
    collation?: string;
    cols?: TableShapeColumn[];
    keys?: TableShapeKey[];
  };
  onSubmit: (data: TableShape) => void;
  wizardHandlers: WizardHandlers;
  database: string;
  mode?: 'create' | 'edit';
};

export const TableForm = ({
  database,
  initialValues = {},
  onSubmit,
  wizardHandlers,
  mode = 'create',
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

  const colsWithUids = useMemo(
    () =>
      (initialValues.cols ?? []).map((col) => ({
        ...col,
        uid: crypto.randomUUID(),
      })),
    [initialValues.cols],
  );

  const keysWithUids = useMemo(
    () =>
      (initialValues.keys ?? []).map((key) => ({
        ...key,
        uid: crypto.randomUUID(),
      })),
    [initialValues.keys],
  );
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
      table: initialValues.table ?? '',
      charset: initialValues.charset ?? defaults.charset,
      engine: initialValues.engine ?? defaults.engine,
      collation: initialValues.collation ?? defaults.collation,
      cols: colsWithUids.length ? colsWithUids : [emptyTableColumn()],
      keys: keysWithUids.length ? keysWithUids : [emptyTableColumnKey()],
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
    wizardHandlers.finish = handleSubmit((values) =>
      onSubmit({ ...values, database }),
    );

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
            mode={mode}
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
          <TableReview
            database={database}
            onValidation={onValidation}
            form={form}
          />
        )}
      </form>
    </>
  );
};
