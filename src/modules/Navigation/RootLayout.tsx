import { Outlet, Link } from 'react-router-dom';
import { useAccountStore } from '>/services/stores';
import { QueryInput } from '>/modules/Query';
import { routes } from '>/config';
import { Sidebar, MessageList, Auth, Guest, DropdownMenu } from '>/modules/.';
// For testing purposes only, remove in production
import { NavigationDebugger } from '>/modules/Debug/NavigationDebugger';

const AuthNavigationLinks = () => (
  <Auth>
    <div className='flex items-center gap-4 w-full'>
      <div className='flex-1'>
        <QueryInput />
      </div>
      <nav className='flex items-center gap-4'>
        <Link className='hover:underline' to={routes.front.settings}>
          Settings
        </Link>
        <Link className='hover:underline' to={routes.front.logout}>
          Logout
        </Link>
      </nav>
    </div>
  </Auth>
);

const GuestNavigationLinks = () => (
  <Guest>
    <nav className='flex items-center gap-4'>
      <Link className='hover:underline' to={routes.front.login}>
        Login
      </Link>
    </nav>
  </Guest>
);

const AuthMenu = () => (
  <Auth>
    <div className='menu'>
      <DropdownMenu label='Account'>
        <Link to={routes.front.newUser}>User Privileges</Link>
        <Link to={routes.front.editUser}>Create User</Link>
        <Link to={routes.front.logout}>Logout</Link>
      </DropdownMenu>

      <div className='menu-separator'>|</div>

      <DropdownMenu label='Database'>
        <Link to={routes.front.newDatabase}>New Database</Link>
        <Link to={routes.front.exportDatabase}>Export Database</Link>
        <Link to={routes.front.createTable}>Create Table</Link>
      </DropdownMenu>
    </div>
  </Auth>
);

const GuestMenu = () => (
  <Guest>
    <DropdownMenu label='User'>
      <Link
        className='block px-4 py-2 hover:bg-gray-100'
        to={routes.front.login}
      >
        Login
      </Link>
    </DropdownMenu>
  </Guest>
);

const AuthMainContent = () => (
  <Auth>
    <aside>
      <Sidebar />
    </aside>
  </Auth>
);

export const RootLayout = () => {
  return (
    <div className='app'>
      <NavigationDebugger />
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
      <div className='flex items-center border-b'>
        <AuthMenu />
        <GuestMenu />
      </div>
      <div>
        <MessageList mode='header' />
      </div>
      <div className='app-content'>
        <AuthMainContent />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
