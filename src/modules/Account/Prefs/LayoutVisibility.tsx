import { useConfigStore } from '>/services/stores';
import { CheckboxField } from '>/modules';
import {
  ItemPreferenceProps,
  SidebarVisibilityTypes,
  SidebarOptions,
} from '>/types';

export const HeaderVisibility = ({ onModify }: ItemPreferenceProps) => {
  const { headerVisibility, setHeaderVisibility } = useConfigStore(
    ({ state, api }) => ({
      headerVisibility: state.headerVisibility,
      setHeaderVisibility: api.setHeaderVisibility,
    }),
  );

  return (
    <div className='area-item'>
      <CheckboxField
        checked={headerVisibility}
        onChange={(value) => {
          onModify({
            headerVisibility: value,
          });
          setHeaderVisibility(value);
        }}
        id='header-all'
        label='Show Header'
      />
    </div>
  );
};

export const SidebarVisibility = ({
  onModify,
  modified,
}: ItemPreferenceProps) => {
  const { sidebarVisibility, setSidebarVisibility } = useConfigStore(
    ({ state, api }) => ({
      sidebarVisibility: state.sidebarVisibility,
      setSidebarVisibility: api.setSidebarVisibility,
    }),
  );

  const allSidebarsVisible = Object.values(sidebarVisibility).every(
    (bar) => bar,
  );

  const bars = Object.keys(sidebarVisibility) as SidebarOptions[];

  return (
    <>
      <div className='area-item'>
        Current Sidebar Width: {modified.sidebarWidth}px
      </div>
      <div className='area-item'>
        <CheckboxField
          checked={allSidebarsVisible}
          onChange={(value) => {
            const next = bars.reduce((acc, key) => {
              acc[key] = value;
              return acc;
            }, {} as SidebarVisibilityTypes);

            onModify({
              sidebarVisibility: next,
            });
            setSidebarVisibility(next);
          }}
          id='sidebar-all'
          label='Show/hide Sidebar'
        />
      </div>
      {bars.map((bar, idx) => {
        return (
          <div key={`${bar}-${idx}`} className='area-item'>
            <CheckboxField
              checked={sidebarVisibility[bar]}
              onChange={(value) => {
                const combinedVisibility = {
                  ...sidebarVisibility,
                  [bar]: value,
                };
                setSidebarVisibility(combinedVisibility);
                onModify({
                  sidebarVisibility: combinedVisibility,
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
