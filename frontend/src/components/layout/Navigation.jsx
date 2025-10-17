import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Settings, 
  LogOut, 
  Code, 
  Menu, 
  X,
  Home,
  Calculator
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navigation = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Friends', href: '/friends', icon: Users },
    { name: 'Progress Board', href: '/progress-board', icon: Trophy },
    { name: 'Comeback Calculator', href: '/comeback-calculator', icon: Calculator },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => {
    const active = location.pathname === href;
    console.log('🔍 Navigation: Checking if', href, 'is active for pathname', location.pathname, '=', active);
    return active;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col w-full bg-white">
          <div className="absolute top-0 right-0 pt-2 pr-4">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <SidebarContent navigation={navigationItems} isActive={isActive} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent navigation={navigationItems} isActive={isActive} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {navigationItems.find(item => isActive(item.href))?.name || 'LeetStalk'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                title="Logout"
                aria-label="Logout from account"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, isActive, onClose }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LeetStalk</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isNewFeature = item.name === 'Comeback Calculator';
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`${
                  isActive(item.href) 
                    ? 'navbar-item-active' 
                    : 'navbar-item'
                } group relative z-10`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  isActive(item.href) 
                    ? 'text-primary-600' 
                    : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="truncate relative z-10">{item.name}</span>
                {isNewFeature && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-500 text-white">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
};

export default Navigation; 