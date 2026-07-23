import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { messageStoreActions } from '>/services/stores';
import {
  useCreateDataRowsMutation,
  useTableColumnsInfoHook,
} from '>/services/queryHooks';
import { useModal } from '>/services/hooks';
import { ScreenLoader } from '>/modules';
import { emptyDataRow } from '>/services/utils';
import { WizardHandlers, ButtonStatus } from '>/types';
import { DataRowsForm } from './DataRowsForm';
import { DataRowsReview } from './DataRowsReview';
import { CreateDataRowsForm } from './commonTypes';

type ButtonsGroupState = Partial<Record<string, ButtonStatus>>;
type TableFormStep = 'insert' | 'review';
const stepOrder: TableFormStep[] = ['insert', 'review'];

type CreateDataRowsProps = {
  database: string;
  table: string;
  wizardHandlers: WizardHandlers;
};
export const CreateDataRows = ({
  wizardHandlers,
  database,
  table,
}: CreateDataRowsProps) => {
  const [step, setStep] = useState<TableFormStep>('insert');

  const request = { database, table };
  const { cols, columnsOrder, isFetching, isSuccess } = useTableColumnsInfoHook(
    request,
    ({ state, query }) => ({
      cols: state.cols,
      columnsOrder: state.columnsOrder,
      isFetching: query.isFetching,
      isFetched: query.isFetched,
      isSuccess: query.isSuccess,
      isError: query.isError,
    }),
  );

  const nextStep = (current: TableFormStep): TableFormStep => {
    const idx = stepOrder.indexOf(current);
    return stepOrder[Math.min(idx + 1, stepOrder.length - 1)];
  };
  const prevStep = (current: TableFormStep): TableFormStep => {
    const idx = stepOrder.indexOf(current);
    return stepOrder[Math.max(idx - 1, 0)];
  };

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

  const goPrevStep = () => {
    const prev = prevStep(step);
    setStep(prev);
  };

  const goNextStep = () => {
    const next = nextStep(step);
    setStep(next);
  };

  const onValidation = (valid: boolean) => updateButtons(step, valid);

  const form = useForm<CreateDataRowsForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      rowsData: [],
    },
  });

  const {
    handleSubmit,
    formState: { isValid, errors },
  } = form;

  useEffect(() => {
    wizardHandlers.next = goNextStep;
    wizardHandlers.previous = goPrevStep;
    wizardHandlers.finish = async () =>
      await handleSubmit((data) => onSubmit(data))();

    return () => {
      wizardHandlers.next = undefined;
      wizardHandlers.previous = undefined;
      wizardHandlers.finish = undefined;
    };
  }, [step]);

  useEffect(() => {
    if (isSuccess) {
      const row = emptyDataRow({ cols, columnsOrder });
      form.reset({
        rowsData: [row],
      });
    }
  }, [isSuccess, cols, columnsOrder]);

  // console.log(
  //   'RENDER CYCLE',
  //   columnsOrder,
  //   cols,
  //   columnsOrder.length,
  //   form.getValues('rowsData')[0]?.values.length,
  // );

  useEffect(() => {
    updateButtons(step, isValid);
  }, [isValid, step]);

  const createDataRowsCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Data rows created successfully', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not create all rows',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to create data rows', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useCreateDataRowsMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    createDataRowsCallbacks,
  );

  // const onSelectRow = (rowId: string) => {
  //   setActiveRowUid(rowId);
  // };

  const onSubmit = (data: CreateDataRowsForm) => {
    const rows = data.rowsData.map((row) =>
      row.values.map((cell) => cell.value),
    );

    mutate({
      cols,
      columnsOrder,
      rows,
      database,
      table,
    });
  };

  const rowValuesLength = form.getValues('rowsData')[0]?.values.length ?? 0;
  const isFormSynced = columnsOrder.length === rowValuesLength;
  const isBusy = isPending || isFetching || !isFormSynced;

  if (isBusy) return <ScreenLoader />;

  return (
    <form className='space-y-4 flex flex-1 flex-col min-h-0'>
      {step === 'insert' && (
        <DataRowsForm
          form={form}
          cols={cols}
          columnsOrder={columnsOrder}
          onValidation={onValidation}
        />
      )}
      {step === 'review' && (
        <DataRowsReview
          database={database}
          table={table}
          form={form}
          columnsOrder={columnsOrder}
          onValidation={onValidation}
        />
      )}
    </form>
  );
};
