import { useFormContext, ControllerFieldState } from 'react-hook-form';
import { buildRulesFromColumn } from '>/services/utils';
import { FormCellField, JsonEditor } from '>/modules';
import { DataEditorType, SqlColumnsShape, AnyControlField } from '>/types';
import { CreateDataRowsForm, DataRowForm } from './commonTypes';

type RenderEditorProps = {
  id?: string;
  field: AnyControlField;
  fieldState: ControllerFieldState;
  editorType: DataEditorType;
};
const renderEditor = ({
  id,
  field,
  fieldState,
  editorType,
}: RenderEditorProps) => {
  switch (editorType) {
    case 'textarea':
      return (
        <textarea
          id={id}
          className='text-dialog-area border input resize-y'
          {...field}
        />
      );

    case 'json':
      return (
        <JsonEditor value={field.value} onChange={(v) => field.onChange(v)} />
      );

    case 'boolean':
      return (
        <input
          id={id}
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
          id={id}
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
          id={id}
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
  const { control, register, setValue, watch, getValues } =
    useFormContext<CreateDataRowsForm>();

  return (
    <>
      {columnsOrder.map((columnName, columnIndex) => {
        const col = cols[columnName];
        const cell = row.values[columnIndex];
        const rules = buildRulesFromColumn(col);

        return (
          <div key={columnName} className='space-y-1'>
            <FormCellField
              id={`col-${rowIndex}-${columnIndex}`}
              name={`rowsData.${rowIndex}.values.${columnIndex}.value`}
              control={control}
              label={`${columnName}:`}
              rules={rules}
              editorType={cell.editorType}
              renderEditor={renderEditor}
            />
          </div>
        );
      })}
    </>
  );
};
