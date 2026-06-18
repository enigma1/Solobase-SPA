import { useFormContext, ControllerFieldState } from 'react-hook-form';
import ReactJsonView, { InteractionProps } from '@microlink/react-json-view';
import { buildRulesFromColumn } from '>/services/utils';
import { FormCellField } from '>/modules';
import { AnyControlField } from '>/modules/Common/Forms/commonTypes';

import { DataCell, DataEditorType, SqlColumnsShape } from '>/types';
import { CreateDataRowsForm, DataRowForm } from './commonTypes';

type RenderEditorProps = {
  field: AnyControlField;
  fieldState: ControllerFieldState;
  editorType: DataEditorType;
};
const renderEditor = ({ field, fieldState, editorType }: RenderEditorProps) => {
  switch (editorType) {
    case 'textarea':
      return <textarea className='text-dialog-area resize-y' {...field} />;

    case 'json':
      return (
        <ReactJsonView
          src={field.value ?? {}}
          onEdit={(e) => field.onChange(e.updated_src)}
          onAdd={(e) => field.onChange(e.updated_src)}
          onDelete={(e) => field.onChange(e.updated_src)}
        />
      );

    case 'boolean':
      return (
        <input
          type='checkbox'
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          className='check'
        />
      );

    case 'number':
      return (
        <input
          {...field}
          type='number'
          value={field.value ?? ''}
          className='w-full input'
          data-status={!!fieldState.error ? 'error' : undefined}
        />
      );

    default:
      return (
        <input
          {...field}
          value={field.value ?? ''}
          className='w-full input'
          data-status={!!fieldState.error ? 'error' : undefined}
        />
      );
  }
};

type DataRowEntryProps = {
  rowIndex: number;
  row: DataRowForm;
  cols: SqlColumnsShape;
  columnsOrder: string[];
};
export const DataRowEntry = ({
  rowIndex,
  row,
  cols,
  columnsOrder,
}: DataRowEntryProps) => {
  // const [activeEditor, setActiveEditor] = useState<{
  //   rowId: string;
  //   columnName: string;
  //   mode: 'input' | 'textarea' | 'json';
  // } | null>(null);

  const { control, register, setValue, watch, getValues } =
    useFormContext<CreateDataRowsForm>();

  // const {
  //   control,
  //   handleSubmit,
  //   clearErrors,
  //   formState: { errors },
  // } = useForm<CreateDataRowsRequest>({
  //   defaultValues: {
  //     database,
  //     table,
  //     rows: [],
  //     cols: {},
  //     columnsOrder: [],
  //   },
  // });

  return (
    <>
      {columnsOrder.map((columnName, columnIndex) => {
        const col = cols[columnName];
        const cell = row.values[columnIndex];
        const rules = buildRulesFromColumn(col);

        return (
          <FormCellField
            key={columnName}
            name={`rowsData.${rowIndex}.values.${columnIndex}.value`}
            control={control}
            label={columnName}
            rules={rules}
            renderEditor={(renderProps) =>
              renderEditor({
                ...renderProps,
                editorType: cell.editorType,
              })
            }
          />
        );
      })}
    </>
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
