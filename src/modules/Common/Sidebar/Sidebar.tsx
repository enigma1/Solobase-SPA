import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CircleChevronUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DatabaseIcon,
  FileStackIcon,
  ChevronsLeftRightEllipsisIcon,
} from 'lucide-react';
import { routes } from '>/config';
import { DatabasesList, TablesList } from '>/modules';
import { useHistoryStore, useAccountStore } from '>/services/stores';
import { QueryList } from '>/modules/Query';
import { useTablesHook } from '>/services/queryHooks';
import { SettingsIcon } from '>/modules/Common/Icons';

export const Sidebar = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    routes.front.dbView,
  );
  const navigate = useNavigate();
  const location = useLocation();

  const { dbSelected } = useAccountStore(({ state, api }) => ({
    dbSelected: state.dbSelected,
  }));

  const { getTablesCount } = useTablesHook(({ api, state }) => ({
    getTablesCount: () => api.getTablesCount(),
    tables: state.tables,
  }));

  const { queryIds } = useHistoryStore(({ state }) => ({
    queryIds: state.queryIds,
  }));

  const sideSections = [
    {
      id: routes.front.dbView,
      getTitle: () => (dbSelected ? dbSelected : 'Databases'),
      component: <DatabasesList />,
      icon: <DatabaseIcon size={20} />,
    },
    {
      id: routes.front.tableView,
      getTitle: () => `Tables: ${getTablesCount()}`,
      component: <TablesList />,
      icon: <FileStackIcon size={20} />,
    },
    {
      id: routes.front.queryView,
      getTitle: () => `Queries: ${queryIds.length}`,
      component: <QueryList />,
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

  const toggleSection = (id: string) => {
    setExpandedSection(id);
    if (location.pathname !== id) {
      navigate(id);
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
                onClick={() => toggleSection(section.id)}
                className='side-accordion-trigger'
              >
                <span className='flex items-center gap-2'>
                  {section.icon}
                  <span>{section.getTitle()}</span>
                </span>

                <CircleChevronUpIcon
                  size={20}
                  className={`icon-muted transition-transform duration-300 ${
                    isActive ? 'rotate-180' : ''
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
