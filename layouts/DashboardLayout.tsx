
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';
import {
  DashboardIcon, UserGroupIcon, BedIcon, DollarSignIcon, CheckSquareIcon, FileTextIcon, UserIcon, LogoutIcon, MenuIcon, CloseIcon
} from '../hooks/Icons';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: ['admin'] },
  { to: '/students', label: 'Students', icon: UserGroupIcon, roles: ['admin'] },
  { to: '/rooms', label: 'Rooms', icon: BedIcon, roles: ['admin'] },
  { to: '/fees', label: 'Fees', icon: DollarSignIcon, roles: ['admin'] },
  { to: '/attendance', label: 'Attendance', icon: CheckSquareIcon, roles: ['admin'] },
  { to: '/reports', label: 'Reports', icon: FileTextIcon, roles: ['admin'] },
  { to: '/personal-details', label: 'My Profile', icon: UserIcon, roles: ['student', 'admin'] },
];

const Sidebar: React.FC<{ isOpen: boolean, toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 bg-dark text-white w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-30 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">HostelMS</h1>
           <button onClick={toggle} className="md:hidden text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-grow p-4">
          <ul>
            {filteredNavItems.map(({ to, label, icon: Icon }) => (
              <li key={to} className="mb-2">
                <NavLink
                  to={to}
                  onClick={toggle}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-md transition-colors ${
                      isActive ? 'bg-primary text-white' : 'hover:bg-slate-700'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center w-full p-2 rounded-md text-left hover:bg-red-500 transition-colors">
            <LogoutIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
       {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={toggle}></div>}
    </>
  );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user } = useAuth();
    return (
        <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex items-center justify-between">
            <button onClick={onMenuClick} className="md:hidden text-slate-600 dark:text-slate-300">
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="hidden md:block font-semibold text-lg">Hostel Management System</div>
            <div className="flex items-center">
                 <span className="text-sm mr-2">{user?.email}</span>
                <UserIcon className="h-8 w-8 text-primary rounded-full" />
            </div>
        </header>
    );
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-light dark:bg-dark">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light dark:bg-dark p-6">
          <div className="animate-fade-in">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
