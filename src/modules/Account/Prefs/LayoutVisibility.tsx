import { useConfigStore } from '>/services/stores';
import { CheckboxField } from '>/modules';

export const HeaderVisibility = () => {
  const { headerVisibility, savePreferences } = useConfigStore(
    ({ state, api }) => ({
      headerVisibility: state.headerVisibility,
      savePreferences: api.savePreferences,
    }),
  );

  const someHeadersVisible = Object.values(headerVisibility).some(
    (head) => head === true,
  );

  return (
    <div className='area-item'>
      <CheckboxField
        checked={someHeadersVisible}
        onChange={(value) => {
          const next = Object.fromEntries(
            Object.keys(headerVisibility).map((key) => [key, value]),
          );
          savePreferences({
            headerVisibility: next,
          });
        }}
        id='header-all'
        label='Show Header'
      />
    </div>
  );
};

export const SidebarVisibility = () => {
  const { sidebarVisibility, savePreferences } = useConfigStore(
    ({ state, api }) => ({
      sidebarVisibility: state.sidebarVisibility,
      savePreferences: api.savePreferences,
    }),
  );

  const allSidebarsVisible = Object.values(sidebarVisibility).every(
    (bar) => bar,
  );

  return (
    <>
      <div className='area-item'>
        <CheckboxField
          checked={allSidebarsVisible}
          onChange={(value) => {
            const next = Object.keys(sidebarVisibility).reduce(
              (acc, key) => {
                acc[key] = value;
                return acc;
              },
              {} as typeof sidebarVisibility,
            );

            savePreferences({
              sidebarVisibility: next,
            });
          }}
          id='sidebar-all'
          label='Show/hide Sidebar'
        />
      </div>
      {Object.keys(sidebarVisibility).map((bar, idx) => {
        return (
          <div key={`${bar}-${idx}`} className='area-item'>
            <CheckboxField
              checked={sidebarVisibility[bar]}
              onChange={(value) => {
                // const { [bar]: removed, ...rest } = sidebarVisibility;
                savePreferences({
                  sidebarVisibility: {
                    ...sidebarVisibility,
                    [bar]: value,
                  },
                });
              }}
              id={`sidebar-${idx}`}
              label={bar}
            />
          </div>
        );
      })}
    </>
  );
};
