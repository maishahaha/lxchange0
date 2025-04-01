import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Home, ListChecks, Plus, Wallet, Shield, LogOut, Sun, Moon } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const { signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
    ${isActive(path) 
      ? 'bg-blue-600 text-white' 
      : isDark 
        ? 'text-gray-300 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-blue-50'}
  `;

  return (
    <nav className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-blue-600">
              LXchange
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <Link to="/" className={linkClass('/')}>
                <Home size={20} />
                Dashboard
              </Link>
              <Link to="/tasks" className={linkClass('/tasks')}>
                <ListChecks size={20} />
                Tasks
              </Link>
              <Link to="/tasks/create" className={linkClass('/tasks/create')}>
                <Plus size={20} />
                Create Task
              </Link>
              <Link to="/wallet" className={linkClass('/wallet')}>
                <Wallet size={20} />
                Wallet
              </Link>
              <Link to="/moderate" className={linkClass('/moderate')}>
                <Shield size={20} />
                Moderate
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => signOut()}
              className={`flex items-center gap-2 px-4 py-2 ${
                isDark 
                  ? 'text-gray-300 hover:text-red-400' 
                  : 'text-gray-700 hover:text-red-600'
              } transition-colors`}
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-t`}>
        <div className="grid grid-cols-5 gap-1 p-2">
          <Link to="/" className="flex flex-col items-center p-2 text-sm">
            <Home size={20} className={`${
              isActive('/') 
                ? 'text-blue-600' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Home</span>
          </Link>
          <Link to="/tasks" className="flex flex-col items-center p-2 text-sm">
            <ListChecks size={20} className={`${
              isActive('/tasks') 
                ? 'text-blue-600' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tasks</span>
          </Link>
          <Link to="/tasks/create" className="flex flex-col items-center p-2 text-sm">
            <Plus size={20} className={`${
              isActive('/tasks/create') 
                ? 'text-blue-600' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Create</span>
          </Link>
          <Link to="/wallet" className="flex flex-col items-center p-2 text-sm">
            <Wallet size={20} className={`${
              isActive('/wallet') 
                ? 'text-blue-600' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wallet</span>
          </Link>
          <Link to="/moderate" className="flex flex-col items-center p-2 text-sm">
            <Shield size={20} className={`${
              isActive('/moderate') 
                ? 'text-blue-600' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Moderate</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}