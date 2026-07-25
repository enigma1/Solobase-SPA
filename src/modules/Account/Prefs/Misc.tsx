import { useConfigStore } from '>/services/stores';
import { CheckboxField } from '>/modules';
import { ItemPreferenceProps } from '>/types';

export const Misc = ({ onModify }: ItemPreferenceProps) => {
  const { allowSystemDatabases, showSystemDatabases } = useConfigStore(
    ({ state, api }) => ({
      allowSystemDatabases: state.allowSystemDatabases,
      showSystemDatabases: api.showSystemDatabases,
    }),
  );

  return (
    <>
      <div className='area-item'>
        <CheckboxField
          checked={allowSystemDatabases}
          onChange={(value) => {
            onModify({
              allowSystemDatabases: value,
            });
            showSystemDatabases(value);
          }}
          id='system-databases'
          label='Show System Databases'
          labelClass='check-label full'
        />
      </div>
    </>
  );
};
