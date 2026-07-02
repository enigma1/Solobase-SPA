import { useRef, useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { queryKeys, useDatabaseServerInfo } from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import { ScreenLoader, DialogContent } from '>/modules';
import { emptyTableColumn, emptyTableColumnKey } from '>/services/utils';
import { ButtonStatus, WizardHandlers } from '>/types';
import {
  TableBasicsForm,
  TableColumnsForm,
  TableKeysForm,
  TableReview,
  TableFormShape,
} from './Form';

type ButtonsGroupState = Partial<Record<string, ButtonStatus>>;
type TableFormStep = 'basics' | 'columns' | 'keys' | 'review';
const stepOrder: TableFormStep[] = ['basics', 'columns', 'keys', 'review'];

type TableFormProps = {
  initialValues?: TableFormShape;
  onSubmit: (data: TableFormShape) => void;
  wizardHandlers: WizardHandlers;
  database: string;
  mode?: 'create' | 'edit';
};

export const TableForm = ({
  database,
  initialValues = { keys: [], cols: [], table: '' },
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

  const defaultValues = useMemo<TableFormShape>(
    () => ({
      ...initialValues,
      table: initialValues.table ?? '',
      charset: initialValues.charset ?? defaults.charset,
      engine: initialValues.engine ?? defaults.engine,
      collation: initialValues.collation ?? defaults.collation,
      cols: initialValues.cols?.map((col) => ({
        ...col,
        uid: crypto.randomUUID(),
      })) ?? [emptyTableColumn()],
      keys: initialValues.keys?.map((key) => ({
        ...key,
        uid: crypto.randomUUID(),
      })) ?? [emptyTableColumnKey()],
    }),
    [initialValues, defaults],
  );

  const form = useForm<TableFormShape>({
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { handleSubmit } = form;

  const originalValues = useRef<TableFormShape>(structuredClone(defaultValues));

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
    wizardHandlers.finish = handleSubmit((values) => onSubmit({ ...values }));

    return () => {
      wizardHandlers.next = undefined;
      wizardHandlers.previous = undefined;
      wizardHandlers.finish = undefined;
    };
  }, [step]);

  // useEffect(() => {
  //   queryClient.invalidateQueries({
  //     queryKey: queryKeys.databaseServerInfo(),
  //     exact: true,
  //   });
  // }, []);

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
    <form className='dialog-form'>
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
          originalValues={originalValues.current}
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
          originalValues={originalValues.current}
        />
      )}
      {step === 'keys' && (
        <TableKeysForm
          onValidation={onValidation}
          form={form}
          originalValues={originalValues.current}
        />
      )}
      {step === 'review' && (
        <TableReview
          database={database}
          onValidation={onValidation}
          form={form}
          originalValues={originalValues.current}
        />
      )}
    </form>
  );
};
