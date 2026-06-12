import { useState, useEffect, useMemo } from 'react';
import { Trash2Icon, ListPlusIcon, SquareActivityIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FormProvider,
  useForm,
  useFieldArray,
  Controller,
  FieldErrors,
  useWatch,
} from 'react-hook-form';
import {
  queryKeys,
  useCreateDataRowsMutation,
  useTableColumnsInfoHook,
} from '>/services/queryHooks';
import { messageStoreActions } from '>/services/stores';
import { FormTextField, ScreenLoader, ComboBox } from '>/modules';
import { FormFieldWrapper } from '>/modules/Common/Forms/FormCommon';
import { CreateDataRowsRequest, BasicRowsShape } from '>/services/api';
import {
  MAX_INSERT_DATA_ROWS,
  emptyDataRow,
  transformColumnsToDefaults,
} from '>/services/utils';
import { DataRowEntry } from './DataRowEntry';
import { CreateDataRowsForm } from './commonTypes';

type CreateDataRowsProps = {
  database: string;
  table: string;
};
export const CreateDataRows = ({ database, table }: CreateDataRowsProps) => {
  const [activeRowUid, setActiveRowUid] = useState<string | null>(null);

  const request = { database, table };
  const { cols, columnsOrder, isFetching, isSuccess } = useTableColumnsInfoHook(
    request,
    ({ state, query }) => ({
      cols: state.cols,
      columnsOrder: state.columnsOrder,
      isFetching: query.isFetching,
      isSuccess: query.isSuccess,
      isError: query.isError,
    }),
  );

  useEffect(() => {
    if (isSuccess) {
      form.reset({
        rowsData: [],
      });
    }
  }, [isSuccess, cols, columnsOrder]);

  const rowDefaults = useMemo(() => transformColumnsToDefaults(cols), [cols]);
  const form = useForm<CreateDataRowsForm>({
    defaultValues: {
      rowsData: [],
    },
  });

  const { control, clearErrors, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rowsData',
  });

  const queryClient = useQueryClient();

  const createDatabaseCallbacks = {
    onSuccess: (data: any) => {
      if (data.ok) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rows(database, table),
          exact: true,
        });
        messageStoreActions.addMessage({
          type: 'success',
          content: { text: 'Database created successfully', duration: 3000 },
        });
      } else {
        messageStoreActions.addMessage({
          content: {
            type: 'warn',
            text: data.message ?? 'Could not create database',
            duration: 3000,
          },
        });
      }
    },
    onError: (error: any) => {
      messageStoreActions.addMessage({
        content: { text: 'Failed to create database', duration: 3000 },
      });
    },
  };

  const { mutate, isPending, response } = useCreateDataRowsMutation(
    ({ api, state, query }) => ({
      isPending: query.isPending,
      mutate: api.mutate,
      response: state,
    }),
    createDatabaseCallbacks,
  );

  // const setEditorMode = () => {};
  const onSelectRow = (rowId: string) => {
    setActiveRowUid(rowId);
  };

  const onRemove = (index: number) => {
    remove(index);
  };

  const onApplyDefaults = () => {};

  const canAddRow = fields.length < MAX_INSERT_DATA_ROWS;

  const onAddRow = () => {
    const item = emptyDataRow(cols);
    append(item);
  };

  const onSubmit = async (data: CreateDataRowsForm) => {
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

  const isBusy = isPending || isFetching;
  if (isBusy) return <ScreenLoader />;

  return (
    <div className='area-container'>
      <div className='area-spacer'>
        <h1 className='area-title'>Insert Data Rows</h1>
        <div className='area-actions'>
          <button
            type='button'
            className='btn'
            onClick={onAddRow}
            title='Add new Row'
            disabled={!canAddRow}
          >
            <ListPlusIcon size={24} />
          </button>
          <button
            type='button'
            className='btn-secondary'
            onClick={onApplyDefaults}
            title='Set Defaults on the active data row'
          >
            <SquareActivityIcon size={24} />
          </button>
        </div>
      </div>
      <div className='area-content'>
        <FormProvider {...form}>
          <form
            className='space-y-4'
            onSubmit={handleSubmit(onSubmit)}
            onClick={() => clearErrors()}
          >
            {fields.map((field, index) => {
              const bg = index % 2 ? 'odd' : 'even';
              return (
                <div
                  key={field.id}
                  className={`area-item separate ${bg} ${
                    activeRowUid === field.uid ? 'active' : ''
                  }`}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-xs font-semibold text-muted'>
                      Row {index + 1}
                    </span>

                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </div>
                  <DataRowEntry
                    uid={field.uid}
                    rowIndex={index}
                    cols={cols}
                    columnsOrder={columnsOrder}
                    active={activeRowUid === field.uid}
                    defaults={rowDefaults}
                  />
                </div>
              );
            })}
          </form>
        </FormProvider>
      </div>
    </div>
  );

  // return (
  //   <div className='area-container'>
  //     <div className='area-spacer'>
  //       <h1 className='area-title'>Insert Data Rows</h1>
  //       <div className='area-actions'>
  //         <button
  //           className='btn-secondary'
  //           onClick={onAddRow}
  //           title='Insert a row in this table'
  //         >
  //           <ListPlusIcon size={24} />
  //         </button>
  //         <button
  //           className='btn-secondary'
  //           onClick={onSetDefaults}
  //           title='Set Data Row Defaults'
  //         >
  //           <SquareActivityIcon size={24} />
  //         </button>
  //       </div>
  //     </div>
  //     <div className='area-content'>
  //       <form
  //         className='space-y-4'
  //         onSubmit={handleSubmit(onSubmit)}
  //         onClick={() => clearErrors()}
  //       >
  //         {fields.map((field, index) => {
  //           const bg = index % 2 ? 'odd' : 'even';
  //           const isActive =
  //             activeCell?.rowId === rowField.id &&
  //             activeCell?.columnName === columnName;

  //           return (
  //             <div
  //               key={field.id}
  //               className={`area-item separate ${bg} ${
  //                 activeRow === field.id ? 'active' : ''
  //               }`}
  //               onClick={() => setActiveRow(field.id)}
  //               onFocus={() => {
  //                 setActiveCell({
  //                   rowId: rowField.id,
  //                   columnName,
  //                 });

  //                 setEditorMode('input');
  //               }}
  //             >
  //               <div className='flex items-center justify-between mb-2'>
  //                 <span className='text-xs font-semibold text-muted'>
  //                   Row {index + 1}
  //                 </span>

  //                 <button
  //                   type='button'
  //                   onClick={(e) => {
  //                     e.stopPropagation();
  //                     onRemove(field.id);
  //                   }}
  //                 >
  //                   <Trash2Icon size={18} />
  //                 </button>
  //               </div>

  //               <div className='flex gap-2 items-start'>
  //                 <div className='flex-1'>
  //                   <Controller
  //                     name={`rows.${index}.value`}
  //                     control={control}
  //                     render={({ field }) => {
  //                       const currentMode =
  //                         activeRow === field.id ? editorMode : 'input';
  //                       switch (currentMode) {
  //                         case 'textarea':
  //                           return (
  //                             <textarea
  //                               value={field.value ?? ''}
  //                               onChange={(e) => field.onChange(e.target.value)}
  //                             />
  //                           );

  //                         case 'json':
  //                           return (
  //                             <ReactJsonView
  //                               src={field.value ?? {}}
  //                               onEdit={(edit) =>
  //                                 field.onChange(edit.updated_src)
  //                               }
  //                               onAdd={(edit) =>
  //                                 field.onChange(edit.updated_src)
  //                               }
  //                               onDelete={(edit) =>
  //                                 field.onChange(edit.updated_src)
  //                               }
  //                             />
  //                           );

  //                         default:
  //                           return (
  //                             <input {...field} value={field.value ?? ''} />
  //                           );
  //                       }
  //                     }}
  //                   />
  //                 </div>

  //                 <button
  //                   type='button'
  //                   onClick={(e) => {
  //                     e.stopPropagation();
  //                     setEditorMode(
  //                       editorMode === 'textarea' ? 'input' : 'textarea',
  //                     );
  //                   }}
  //                 >
  //                   <TypeIcon size={18} />
  //                 </button>

  //                 <button
  //                   type='button'
  //                   onClick={(e) => {
  //                     e.stopPropagation();
  //                     setEditorMode(editorMode === 'json' ? 'input' : 'json');
  //                   }}
  //                 >
  //                   <FileBracesCornerIcon size={18} />
  //                 </button>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </form>
  //     </div>
  //   </div>
  // );
};
