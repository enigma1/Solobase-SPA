import { useConfigStore } from '>/services/stores';
import { CheckboxField } from '>/modules';
import { ItemPreferenceProps } from '>/types';

export const Misc = ({ onModify }: ItemPreferenceProps) => {
  const {
    allowSystemDatabases,
    showSystemDatabases,
    objectEditorForJson,
    showObjectEditorForJson,
  } = useConfigStore(({ state, api }) => ({
    allowSystemDatabases: state.allowSystemDatabases,
    showSystemDatabases: api.showSystemDatabases,
    objectEditorForJson: state.objectEditorForJson,
    showObjectEditorForJson: api.showObjectEditorForJson,
  }));

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
      <div className='area-item'>
        <CheckboxField
          checked={objectEditorForJson}
          onChange={(value) => {
            onModify({
              objectEditorForJson: value,
            });
            showObjectEditorForJson(value);
          }}
          id='object-editor-for-json'
          label='Use Object Editor for JSON'
          labelClass='check-label full'
        />
      </div>
    </>
  );
};
