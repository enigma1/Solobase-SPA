export const isColumnParameterValid = (param: string, value: unknown) => {
  const required = param.endsWith('*');
  const name = param.replace(/\s*\*$/, '');

  if (!value?.toString().trim()) {
    return required ? 'Required' : true;
  }

  switch (name) {
    case 'length':
    case 'precision':
    case 'scale':
      return /^\d+$/.test(String(value)) || 'Must be an integer';

    case 'values':
      return (
        String(value)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean).length > 0 || 'At least one value is required'
      );

    default:
      return true;
  }
};
