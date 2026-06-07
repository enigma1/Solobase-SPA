import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAccountStore, dialogStoreActions } from '>/services/stores';
import { routes } from '>/config';
import {
  HeartbeatMonitor,
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
import { useDebouncer } from '>/services/hooks/common';
import { AuthNavigationLinks } from './NavigationLinks';

const GuestNavigationLinks = () => null;
const GuestMenu = () => null;

const AuthMenu = () => (
  <Auth>
    <div className='menu'>
      <DropdownMenu label='Account'>
        <Link to={routes.front.newUser}>User Privileges</Link>
        <Link to={routes.front.editUser}>Create User</Link>
        <Link to={routes.front.settings}>Settings</Link>
        <Link to={routes.front.logout}>Logout</Link>
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
        <Link to={routes.front.listDatabases}>Show Databases</Link>
      </DropdownMenu>
      <div className='menu-separator'>|</div>
      <DropdownMenu label='Tables'>
        <Link to={routes.front.newDatabase}>New Table</Link>
        <Link to={routes.front.listTables}>Show Tables</Link>
      </DropdownMenu>
    </div>
  </Auth>
);

const AuthSideContent = () => (
  <Auth>
    <aside>
      <Sidebar />
    </aside>
  </Auth>
);

export const RootLayout = () => {
  const online = useAccountStore(({ state }) => state.online);
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
        <HeartbeatMonitor />
        <NavigationDebugger />
        {online && (
          <>
            <header className='app-header'>
              <div className='app-logo'>
                <Link to={routes.front.home} className='font-semibold'>
                  Home
                </Link>
              </div>
              <nav className='w-full flex items-center gap-4'>
                <AuthNavigationLinks />
                <GuestNavigationLinks />
              </nav>
            </header>

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
