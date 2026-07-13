import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CircleChevronLeftIcon,
  DatabaseIcon,
  FileStackIcon,
  ChevronsLeftRightEllipsisIcon,
  CircleSlash2Icon,
} from 'lucide-react';
import { routes } from '>/config';
import {
  DatabasesSideList,
  QueriesSideList,
  TablesSideList,
  dialogFactories,
} from '>/modules';
import {
  useAccountStore,
  useConfigStore,
  dialogStoreActions,
  queriesStoreActions,
} from '>/services/stores';
import { useTables } from '>/services/queryHooks';
import { SidebarOptions } from '>/types';

export const Sidebar = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    routes.front.listDatabases,
  );
  const navigate = useNavigate();
  const location = useLocation();

  const { sidebarVisibility, pageSizes } = useConfigStore(({ state }) => ({
    sidebarVisibility: state.sidebarVisibility,
    pageSizes: state.pageSizes,
  }));

  const { dbSelected, activeTable } = useAccountStore(({ state }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  type SidebarItem = {
    id: SidebarOptions;
    getTitle: () => string;
    getRoute: () => string;
    component: ReactNode;
    icon: ReactNode;
  };

  const sideSections: SidebarItem[] = [
    {
      id: 'sideDatabases',
      getTitle: () =>
        `${dbSelected ? dbSelected : 'Databases'} (${pageSizes.dbRows}/page)`,
      getRoute: () => routes.front.listDatabases,
      component: <DatabasesSideList />,
      icon: (
        <span title='Create Database'>
          <DatabaseIcon
            size={20}
            onClick={() => {
              dialogStoreActions.openDialog({
                payload: dialogFactories.createDatabase(),
              });
            }}
          />
        </span>
      ),
    },
    {
      id: 'sideTables',
      getTitle: () => `Tables (${pageSizes.tableRows}/page)`,
      getRoute: () => {
        if (activeTable && expandedSection === 'sideTables') {
          return routes.front.listTables;
        } else {
          return activeTable ? routes.front.listData : routes.front.listTables;
        }
      },
      component: <TablesSideList />,
      icon: dbSelected ? (
        <span title='Create Table'>
          <FileStackIcon
            size={20}
            onClick={() => {
              dialogStoreActions.openDialog({
                payload: dialogFactories.createTable(dbSelected),
              });
            }}
          />
        </span>
      ) : (
        <CircleSlash2Icon size={20} />
      ),
    },
    {
      id: 'sideQueries',
      getTitle: () => `Queries`,
      getRoute: () => routes.front.listQueries,
      component: <QueriesSideList />,
      icon: (
        <ChevronsLeftRightEllipsisIcon
          size={20}
          onClick={() => {
            dialogStoreActions.openDialog({
              payload: dialogFactories.makeQuery(),
            });
          }}
        />
      ),
    },
  ];

  const visibleSideSections = sideSections.filter(
    (section) => sidebarVisibility[section.id],
  );

  const toggleSection = (section: SidebarItem) => {
    setExpandedSection(section.id);
    const route = section.getRoute();
    if (route && location.pathname !== route) {
      navigate(route);
    }
  };

  return (
    <>
      {visibleSideSections.map((section) => {
        const isActive = expandedSection === section.id;

        return (
          <section
            key={section.id}
            className='side-accordion'
            data-open={isActive}
          >
            <div className='side-accordion-header'>
              <button
                onClick={() => toggleSection(section)}
                className='side-accordion-trigger'
              >
                <span className='flex items-center gap-2'>
                  {section.icon}
                  <span>{section.getTitle()}</span>
                </span>

                <CircleChevronLeftIcon
                  size={20}
                  className={`icon-muted transition-transform duration-300 ${
                    isActive ? '-rotate-90' : ''
                  }`}
                />
              </button>
            </div>

            <div className='side-accordion-content'>
              <div>{section.component}</div>
            </div>
          </section>
        );
      })}
    </>
  );
};
