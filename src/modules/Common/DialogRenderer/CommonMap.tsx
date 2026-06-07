import { ReactNode, useState, useMemo } from 'react';
import ReactJsonView from '@microlink/react-json-view';
import { Checkbox, ModalDialog } from '>/modules';
import { Scalar, DialogPayload, ButtonStatus } from '>/types';
import { ModalContext, useModal } from '>/services/hooks';

type DialogComponentProps = {
  payload: DialogPayload;
  onClose: () => void;
};

export const DialogComponent = ({ payload, onClose }: DialogComponentProps) => {
  const initialStatuses =
    payload?.actions?.reduce(
      (acc, action) => {
        if (!action.id || !action.status) return acc;

        acc[action.id] = action.status;
        return acc;
      },
      {} as Record<string, ButtonStatus>,
    ) ?? {};

  const [buttonsStatus, setButtonsStatus] =
    useState<Record<string, ButtonStatus>>(initialStatuses);

  //Setup Setters
  const setButtonStatus = (id: string, status?: ButtonStatus) => {
    setButtonsStatus((prev) => {
      const next = { ...prev };
      if (status === undefined) {
        delete next[id];
      } else {
        next[id] = status;
      }
      return next;
    });
  };

  const setButtonsStatuses = (
    updates: Partial<Record<string, ButtonStatus>>,
  ) => {
    setButtonsStatus((prev) => {
      const next = { ...prev };

      for (const [id, status] of Object.entries(updates)) {
        if (status === undefined) {
          delete next[id];
        } else {
          next[id] = status;
        }
      }

      return next;
    });
  };

  const buttons: ReactNode[] =
    payload?.actions?.map((a, idx) => {
      const status = a.id ? buttonsStatus[a.id] : undefined;
      return (
        <button
          key={`${a.label}-${idx}`}
          onClick={a.onClick}
          className={`${a.classes ?? 'btn-secondary'}`}
          data-status={status ?? 'active'}
        >
          {a.label}
        </button>
      );
    }) ?? [];
  return (
    <ModalContext.Provider
      value={{
        onClose,
        variant: payload.variant,
        initialSize: payload.initialSize,
        buttonsStatus,
        setButtonStatus,
        setButtonsStatuses,
      }}
    >
      <ModalDialog
        onClose={onClose}
        caption={payload.caption}
        content={payload.component}
        controls={buttons}
      />
    </ModalContext.Provider>
  );
};

type FilterColumnsProps = {
  hiddenColumns: Record<string, boolean>;
  columnsOrder: string[];
  onChange: (name: string, hide: boolean) => void;
};
export const FilterColumns = ({
  columnsOrder,
  hiddenColumns,
  onChange,
}: FilterColumnsProps) => {
  const { setButtonStatus } = useModal();
  const [localHiddenColumns, setLocalHiddenColumns] = useState(hiddenColumns);
  return (
    <div className='area-container'>
      {columnsOrder.map((col, idx) => {
        const bgStyle = idx % 2 ? 'odd' : 'even';
        return (
          <div key={`${col}-${idx}`} className={`area-item ${bgStyle}`}>
            <label key={col} className='flex items-center gap-2'>
              <Checkbox
                checked={!Boolean(localHiddenColumns[col])}
                onChange={(checked) => {
                  if (checked) {
                    const { [col]: removed, ...rest } = localHiddenColumns;
                    setLocalHiddenColumns(rest);
                  } else {
                    setLocalHiddenColumns({
                      ...localHiddenColumns,
                      [col]: true,
                    });
                  }
                  setButtonStatus('confirm');
                  onChange(col, !checked);
                }}
              />
              {col}
            </label>
          </div>
        );
      })}
    </div>
  );
};

type EditDataCellRawProps = {
  value: Scalar;
  onChange: (value: Scalar) => void;
};

export const EditDataCellRaw = ({
  value: cellValue,
  onChange,
}: EditDataCellRawProps) => {
  const { setButtonStatus } = useModal();

  const isObject = typeof cellValue === 'object' && cellValue !== null;
  if (isObject) {
    return (
      <ReactJsonView
        theme='bright:inverted'
        src={cellValue}
        name={false}
        // collapsed={true}
        onEdit={(e) => onChange(e.updated_src as Scalar)}
        onAdd={(e) => onChange(e.updated_src as Scalar)}
        onDelete={(e) => onChange(e.updated_src as Scalar)}
      />
    );
  } else {
    return (
      <textarea
        defaultValue={String(cellValue ?? '')}
        // rows={50}
        onChange={(e) => {
          setButtonStatus('confirm');
          onChange(e.target.value);
        }}
        className='text-dialog-area'
      />
    );
  }
};
