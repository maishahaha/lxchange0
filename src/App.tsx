import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { CreateTask } from './components/CreateTask';
import { TaskSubmission } from './components/TaskSubmission';
import { WalletDashboard } from './components/WalletDashboard';
import { ModeratorDashboard } from './components/ModeratorDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const { isDark } = useThemeStore();
  
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuthStore();
  const { isDark } = useThemeStore();

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className={isDark ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={!user ? <AuthForm /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
          <Route path="/tasks/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
          <Route path="/tasks/:taskId/submit" element={<ProtectedRoute><TaskSubmission /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletDashboard /></ProtectedRoute>} />
          <Route path="/moderate" element={<ProtectedRoute><ModeratorDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App