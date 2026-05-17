import ReactJsonView from '@microlink/react-json-view';
import { DialogMap } from '>/types/dialog';
import { ModalDialog } from '>/modules/Common';
import { Scalar } from '>/types/dbTables';

export const tableDialogMap: DialogMap = ({ payload, onClose }) => ({
  unsavedChanges: () => {
    if (!payload) return null;
    const { message, caption, onConfirm } = payload as {
      message: string;
      caption: string;
      onConfirm: () => void;
    };
    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption={caption}
        content={message}
        controls={
          <div className='flex gap-2 justify-end'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>
            <button onClick={onConfirm} className='btn-primary'>
              Confirm
            </button>
          </div>
        }
      />
    );
  },
  discardChanges: () => {
    if (!payload) return null;
    const { message, caption, onConfirm } = payload as {
      message: string;
      caption: string;
      onConfirm: () => void;
    };
    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption={caption}
        content={message}
        controls={
          <div className='flex gap-2 justify-end'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>
            <button onClick={onConfirm} className='btn-primary'>
              Confirm
            </button>
          </div>
        }
      />
    );
  },

  editCell: () => {
    if (!payload) return null;

    const { row, colName, cId, rId, onSave } = payload as {
      row: Scalar[];
      rId: number;
      cId: number;
      colName: string;
      onSave: (newValue: any) => void;
    };

    const cellValue = row[cId];
    const isObject = typeof cellValue === 'object' && cellValue !== null;
    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption={`Edit ${colName} @row:[${rId}]`}
        content={
          isObject ? (
            <ReactJsonView
              theme='bright:inverted'
              src={cellValue}
              name={false}
              // collapsed={true}
              onEdit={(e) => (row[cId] = e.updated_src as Scalar)}
              onAdd={(e) => (row[cId] = e.updated_src as Scalar)}
              onDelete={(e) => (row[cId] = e.updated_src as Scalar)}
            />
          ) : (
            <textarea
              defaultValue={String(cellValue ?? '')}
              rows={4}
              onChange={(e) => (row[cId] = e.target.value)}
              className='text-dialog-area'
            />
          )
        }
        controls={
          <div className='flex gap-2 justify-end'>
            <button onClick={onClose} className='px-4 py-2 rounded border'>
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(row[cId]);
                onClose();
              }}
              className='px-4 py-2 rounded border font-medium'
            >
              Confirm
            </button>
          </div>
        }
      />
    );
  },
});
