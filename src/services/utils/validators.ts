import { FieldValues } from 'react-hook-form';

export const isColumnParameterValid = (param: string, value: unknown) => {
  const required = param.endsWith('*');
  const name = param
    .replace(/\s*\*$/, '')
    .trim()
    .toLowerCase();

  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

  if (isEmpty) {
    return required ? 'Required' : true;
  }

  switch (name) {
    case 'length':
    case 'precision':
    case 'scale': {
      const num = Number(value);
      if (!Number.isInteger(num)) {
        return 'Must be an integer';
      }
      if (num <= 0) {
        return 'Must be greater than 0';
      }
      return true;
    }

    case 'values': {
      return (
        (typeof value === 'string' &&
          value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean).length > 0) ||
        'At least one value is required'
      );
    }

    default:
      return true;
  }
};

type HasDuplicatedProps<T> = {
  entries: T[];
  prop: keyof T;
};

export const hasDuplicatedValues = <T>({
  entries,
  prop,
}: HasDuplicatedProps<T>) => {
  const values = entries
    .map((item) => String(item[prop]).trim().toLowerCase())
    .filter(Boolean);

  return values.some((value, idx) => values.indexOf(value) !== idx);
};

type IsDuplicatedProps<T> = {
  entries: T[];
  prop: keyof T;
  value: unknown;
  index: number;
};

export const isDuplicatedValue = <T>({
  entries,
  prop,
  value,
  index,
}: IsDuplicatedProps<T>) => {
  const normalized = String(value).trim().toLowerCase();
  return entries.some((item, i) => {
    if (i === index) return false;
    return String(item[prop]).trim().toLowerCase() === normalized;
  });
};
