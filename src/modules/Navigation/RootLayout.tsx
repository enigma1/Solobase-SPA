import { useRef } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import {
  useAccountStore,
  dialogStoreActions,
  useConfigStore,
} from '>/services/stores';
import { routes } from '>/config';
import { startSidebarResize } from '>/services/hooks';
import {
  AliveMonitor,
  Sidebar,
  MessageList,
  Auth,
  Guest,
  DropdownMenu,
  GlobalDialog,
  dialogFactories,
} from '>/modules';
// For testing purposes only, remove in production
import { NavigationDebugger } from '>/modules/Debug/NavigationDebugger';
import {
  handleLogin,
  handleLogout,
  handlePreferences,
  handleCreateUser,
  handleYourPrivileges,
  handleClearSession,
} from '>/modules/Account';
import { useDebouncer } from '>/services/hooks/common';
import { AuthNavigationLinks } from './NavigationLinks';
import Logo from '>/assets/images/solo-base-xp.svg?react';

const GuestNavigationLinks = () => null;
const GuestMenu = () => {
  return (
    <Guest>
      <div className='menu'>
        <a className='menu-trigger' href='#' onClick={handleLogin}>
          Login
        </a>
        <div className='menu-separator'>|</div>
        <a className='menu-trigger' href='#' onClick={handleClearSession}>
          Clear Session
        </a>
      </div>
    </Guest>
  );
};

const AuthMenu = () => {
  const { dbSelected, capabilities } = useAccountStore(({ state }) => ({
    dbSelected: state.dbSelected,
    capabilities: state.capabilities,
  }));

  return (
    <Auth>
      <div className='menu'>
        <DropdownMenu label='Account'>
          <a href='#' onClick={handleYourPrivileges}>
            User Privileges
          </a>
          <a href='#' onClick={handlePreferences}>
            Settings
          </a>
          <a href='#' onClick={handleLogout}>
            Logout
          </a>
        </DropdownMenu>
        <div className='menu-separator'>|</div>
        <DropdownMenu label='Server'>
          <a
            href='#'
            onClick={() => {
              dialogStoreActions.openDialog({
                payload: dialogFactories.clearPendingRequests(),
              });
            }}
          >
            Clear Pending Requests
          </a>
        </DropdownMenu>
        <div className='menu-separator'>|</div>
        <DropdownMenu label='Database'>
          <a
            href='#'
            onClick={() =>
              dialogStoreActions.openDialog({
                payload: dialogFactories.createDatabase(),
              })
            }
          >
            New Database
          </a>
          <Link to={routes.front.listDatabases}>List Databases</Link>
          <a
            href='#'
            onClick={() =>
              dialogStoreActions.openDialog({
                payload: dialogFactories.importData(),
              })
            }
          >
            Import / Run Script
          </a>
          <Link to={routes.front.importView}>Last SQL Processed</Link>
        </DropdownMenu>
        <div className='menu-separator'>|</div>
        <DropdownMenu
          label='Tables'
          disabled={!dbSelected}
          title={!dbSelected ? 'Select a database first' : undefined}
        >
          <a
            href='#'
            onClick={() => {
              dialogStoreActions.openDialog({
                payload: dialogFactories.createTable(dbSelected),
              });
            }}
          >
            New Table
          </a>
          <Link to={routes.front.listTables}>Show Tables</Link>
        </DropdownMenu>
        <div className='menu-separator'>|</div>
        <DropdownMenu label='Queries'>
          <a
            href='#'
            onClick={() => {
              dialogStoreActions.openDialog({
                payload: dialogFactories.makeQuery(),
              });
            }}
          >
            New Query
          </a>
          <Link to={routes.front.listQueries}>List Queries</Link>
          <a
            href='#'
            onClick={() => {
              dialogStoreActions.openDialog({
                payload: dialogFactories.queriesExecuted(),
              });
            }}
          >
            Executed Queries
          </a>
        </DropdownMenu>
        <>
          <div className='menu-separator'>|</div>
          <DropdownMenu label='Users'>
            <a href='#' onClick={handleCreateUser}>
              Create User
            </a>
            <Link to={routes.front.listUsers}>List Users</Link>
          </DropdownMenu>
        </>
      </div>
    </Auth>
  );
};

const AuthSideContent = () => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const { sidebarVisibility, sidebarWidth } = useConfigStore(({ state }) => ({
    sidebarVisibility: state.sidebarVisibility,
    sidebarWidth: state.sidebarWidth,
  }));

  if (Object.values(sidebarVisibility).every((bar) => !bar)) {
    return null;
  }

  return (
    <Auth>
      <div
        ref={sidebarRef}
        className='sidebar-wrapper'
        style={{ width: sidebarWidth }}
      >
        <aside>
          <Sidebar />
        </aside>
        <div
          className='resize-handle'
          onMouseDown={(e) =>
            startSidebarResize({
              e,
              sidebarRef,
            })
          }
        />
      </div>
    </Auth>
  );
};

export const RootLayout = () => {
  const online = useAccountStore(({ state }) => state.online);
  const headerVisibility = useConfigStore(
    ({ state }) => state.headerVisibility,
  );
  const location = useLocation();

  // const [stableOnline, setStableOnline] = useState(online);

  // const { debounce } = useDebouncer<[boolean]>({
  //   delay: 300,
  //   callback: setStableOnline,
  // });

  // useEffect(() => {
  //   debounce(online);
  // }, [online, debounce]);

  if (!online && location.pathname !== routes.front.networkDown) {
    return <Navigate to={routes.front.networkDown} replace />;
  }

  return (
    <>
      <div className='app'>
        <AliveMonitor />
        <NavigationDebugger />
        {online && (
          <>
            <div>
              <MessageList mode='top' />
            </div>
            {headerVisibility && (
              <header className='app-header'>
                <div className='app-logo'>
                  <Link to={routes.front.home} className='font-semibold'>
                    <Logo className='text-logo' />
                  </Link>
                </div>
                <nav className='w-full flex items-center gap-4'>
                  <AuthNavigationLinks />
                  <GuestNavigationLinks />
                </nav>
              </header>
            )}

            <div className='menu-container'>
              <AuthMenu />
              <GuestMenu />
            </div>
          </>
        )}
        <div>
          <MessageList mode='header' />
        </div>
        <div className='app-content'>
          {online && <AuthSideContent />}
          <main>
            <Outlet />
          </main>
        </div>
      </div>
      <GlobalDialog />
    </>
  );
};
