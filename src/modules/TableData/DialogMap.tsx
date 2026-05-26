import ReactJsonView from '@microlink/react-json-view';
import { DialogMap } from '>/types/dialog';
import { ModalDialog } from '>/modules/Common';
import { Scalar } from '>/types/dbTables';

export const tableDataDialogMap: DialogMap = ({ payload, onClose }) => ({
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
          <div className='btn-group'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>
            <button onClick={onConfirm} className='btn'>
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
          <div className='btn-group justify-end'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>
            <button onClick={onConfirm} className='btn'>
              Confirm
            </button>
          </div>
        }
      />
    );
  },

  filterColumns: () => {
    if (!payload) return null;
    const { columns, onSave } = payload as {
      columns: { name: string; visible: boolean }[];
      onSave: (newOrder: string[]) => void;
    };
    return (
      <ModalDialog
        isOpen
        onClose={onClose}
        caption='Filter Columns'
        content={
          <div className='flex flex-col gap-2'>
            {columns.map((col) => (
              <label key={col.name} className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={col.visible}
                  onChange={() =>
                    onSave(columns.filter((c) => c.visible).map((c) => c.name))
                  }
                />
                {col.name}
              </label>
            ))}
          </div>
        }
        controls={
          <div className='btn-group justify-end'>
            <button onClick={onClose} className='btn-primary'>
              Close
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
          <div className='btn-group justify-end'>
            <button onClick={onClose} className='btn-secondary'>
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(row[cId]);
                onClose();
              }}
              className='btn'
            >
              Confirm
            </button>
          </div>
        }
      />
    );
  },
});
