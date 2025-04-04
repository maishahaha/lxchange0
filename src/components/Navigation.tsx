import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { supabase } from '../lib/supabase';
import { Home, ListChecks, Plus, Wallet, Shield, LogOut, Sun, Moon, MessageSquare, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
    ${isActive(path) 
      ? 'bg-blue-600 text-white' 
      : isDark 
        ? 'text-gray-300 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-blue-50'}
  `;

  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    // Load initial notifications
    loadNotifications();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <nav className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg relative z-50`}>
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
              <Link to="/posts" className={linkClass('/posts')}>
                <MessageSquare size={20} />
                Posts
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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition-colors relative ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl ${
                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  } z-[9999]`}
                  style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
                >
                  <div className="p-4">
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      {notifications.length === 0 ? (
                        <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          No notifications
                        </p>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-3 rounded-lg cursor-pointer ${
                              !notification.read
                                ? isDark
                                  ? 'bg-blue-900/20'
                                  : 'bg-blue-50'
                                : isDark
                                ? 'bg-gray-700/50'
                                : 'bg-gray-50'
                            }`}
                          >
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            <span className={`text-xs mt-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
        <div className="grid grid-cols-6 gap-1 p-2">
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
          <Link to="/posts" className="flex flex-col items-center p-2 text-sm">
            <MessageSquare size={20} className={`${
              isActive('/posts') 
                ? 'text-blue-600' 
                : isDark ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Posts</span>
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