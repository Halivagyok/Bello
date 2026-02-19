import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from './store';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import ProjectPage from './pages/ProjectPage';
import AdminPage from './pages/AdminPage';
import MainLayout from './layouts/MainLayout';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(state => state.user);
  const authLoading = useStore(state => state.authLoading);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export const App = () => {
  const checkAuth = useStore((state) => state.checkAuth);
  const user = useStore((state) => state.user);
  const authLoading = useStore((state) => state.authLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navigate = useNavigate();
  useEffect(() => {
    const handleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent;
      navigate(customEvent.detail);
    };
    window.addEventListener('app-navigate', handleNavigation);
    return () => window.removeEventListener('app-navigate', handleNavigation);
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0079bf] dark:bg-[#0c2b4e] text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h1 className="text-2xl font-bold tracking-tight">Bello</h1>
        <p className="mt-2 text-white/70 text-sm">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/boards" />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/boards" element={<DashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route path="/admin" element={user?.isAdmin ? <AdminPage /> : <Navigate to="/" />} />
      </Route>

      <Route path="/boards/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? "/boards" : "/login"} />} />
    </Routes>
  );
}