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
  DatabaseNew,
  DatabasesSideList,
  TableNew,
  TablesSideList,
  dialogFactories,
} from '>/modules';
import {
  useHistoryStore,
  useAccountStore,
  dialogStoreActions,
} from '>/services/stores';
import { WizardHandlers } from '>/types';
import { QueriesSideList } from '</src/modules/Queries';
import { useTablesHook } from '>/services/queryHooks';
import { dialogActions } from '>/services/utils';

export const Sidebar = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    routes.front.dbView,
  );
  const navigate = useNavigate();
  const location = useLocation();

  const { dbSelected, activeTable } = useAccountStore(({ state }) => ({
    activeTable: state.activeTable,
    dbSelected: state.dbSelected,
  }));

  const { getTablesCount } = useTablesHook(({ api }) => ({
    getTablesCount: () => api.getTablesCount(),
  }));

  const { queryIds } = useHistoryStore(({ state }) => ({
    queryIds: state.queryIds,
  }));

  type SideSectionItem = {
    id: string;
    getTitle: () => string;
    getRoute: () => string;
    component: ReactNode;
    icon: ReactNode;
  };
  const sideSections: SideSectionItem[] = [
    {
      id: 'sideDatabases',
      getTitle: () => (dbSelected ? dbSelected : 'Databases'),
      getRoute: () => routes.front.dbView,
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
      getTitle: () => `Tables: ${getTablesCount()}`,
      getRoute: () => {
        if (activeTable && expandedSection === 'sideTables') {
          return routes.front.listTables;
        } else {
          return activeTable ? routes.front.tableView : routes.front.listTables;
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
      getTitle: () => `Queries: ${queryIds.length}`,
      getRoute: () => routes.front.queryView,
      component: <QueriesSideList />,
      icon: <ChevronsLeftRightEllipsisIcon size={20} />,
    },

    // ...(queries.length > 0
    //   ? [
    //       {
    //         id: 'queries',
    //         getTitle: () => `Queries: ${queries.length}`,
    //         component: <QueryList />,
    //       },
    //     ]
    //   : []),

    // { id: 'users', title: 'Users', component: <UsersList /> },
    // { id: 'privileges', title: 'Privileges', component: <PrivilegesList /> },
  ];

  const toggleSection = (section: SideSectionItem) => {
    setExpandedSection(section.id);
    const route = section.getRoute();
    if (route && location.pathname !== route) {
      navigate(route);
    }
  };

  const gotoSection = (id: string) => {
    setExpandedSection(id);
    if (location.pathname !== id) {
      navigate(id);
    }
  };
  // useEffect(() => {
  //   if (dbSelected && location.pathname === routes.front.dbView) {
  //     setExpandedSection('tables');
  //   }
  // }, [dbSelected]);
  return (
    <>
      {sideSections.map((section) => {
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
