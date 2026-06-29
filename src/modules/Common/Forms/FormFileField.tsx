import { DragEvent, ChangeEvent, useRef, useState } from 'react';
import clsx from 'clsx';
import { FileIcon, UploadIcon } from 'lucide-react';

import {
  FieldValues,
  Controller,
  Path,
  Control,
  RegisterOptions,
} from 'react-hook-form';
import { FormFieldWrapper } from './FormCommon';
import { ComboBox } from '>/modules';
import { FormCommonFieldProps, Option, OptionGroup, StatusType } from '>/types';
import { formatSize } from '>/services/utils';
import { InputField } from './FormInputField';

type DropFileAreaText = {
  title?: string;
  subtitle?: string;
  browseButton?: string;
  replaceButton?: string;
  removeButton?: string;
};

type DropFileAreaProps = {
  value?: File | null;
  label?: string;
  notice?: string;
  status?: StatusType;
  className?: string;
  texts: DropFileAreaText;
  open: () => void;
  onDrop: (file: File | null) => void;
  onRemove: () => void;
};

const DropFileArea = ({
  value,
  className,
  texts,
  open,
  onDrop,
  onRemove,
}: DropFileAreaProps) => {
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const { title, subtitle, browseButton, replaceButton, removeButton } = texts;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    onDrop(e.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div
      className={clsx(
        'drop-area',
        {
          dragging: isDragging,
          'has-file': !!value,
        },
        className,
      )}
      onClick={open}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {value ? (
        <>
          <FileIcon />
          <div>{value.name}</div>
          <div>{formatSize(value.size)}</div>
          <button type='button'>{replaceButton}</button>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            {removeButton}
          </button>
        </>
      ) : (
        <>
          <UploadIcon />
          <div>{title}</div>
          <div>{subtitle}</div>
          <button type='button'>{browseButton}</button>
        </>
      )}
    </div>
  );
};

type DropFileFieldProps = {
  status?: StatusType;
  notice?: string;

  value?: File | null;
  texts: DropFileAreaText;
  onValueChange: (file: File | null) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
};
export const DropFileField = ({
  value,
  texts,
  onValueChange,
  inputProps,
  containerProps,
}: DropFileFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] ?? null;
    onValueChange(file);
  };

  const handleDrop = (file: File | null) => {
    onValueChange(file);
  };

  const handleRemove = () => {
    onValueChange(null);
  };

  const open = () => inputRef.current?.click();

  return (
    <>
      <DropFileArea
        {...containerProps}
        value={value}
        open={open}
        onRemove={handleRemove}
        onDrop={handleDrop}
        texts={texts}
        className={clsx('drop-area', containerProps?.className)}
      />
      <input
        {...inputProps}
        ref={inputRef}
        hidden
        type='file'
        onChange={handleChange}
      />
    </>
  );
};

type FormFileFieldProps<T extends FieldValues> = {
  id?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  texts: DropFileAreaText;
};

export const FormFileField = <T extends FieldValues>({
  name,
  control,
  rules,
  texts,
  ...rest
}: FormFileFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <DropFileField
          {...rest}
          texts={texts}
          value={field.value}
          onValueChange={field.onChange}
          status={fieldState.error ? 'error' : undefined}
          notice={fieldState.error?.message}
        />
      )}
    />
  );
};
