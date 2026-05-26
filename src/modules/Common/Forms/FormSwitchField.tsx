import { FieldValues, Path, Control, Controller } from 'react-hook-form';
import { Switch } from '>/modules';

export const FormSwitchField = <T extends FieldValues>({
  name,
  control,
}: {
  name: Path<T>;
  control: Control<T>;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Switch checked={!!field.value} onChange={field.onChange} />
      )}
    />
  );
};
