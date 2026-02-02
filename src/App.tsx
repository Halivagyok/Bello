import React, { useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import ProjectPage from './pages/ProjectPage';
import AdminPage from './pages/AdminPage';
import MainLayout from './layouts/MainLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(state => state.user);
  const authLoading = useStore(state => state.authLoading);

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        backgroundColor: '#f4f5f7', color: '#026aa7'
      }}>
        Loading...
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

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        backgroundColor: '#0079bf', color: 'white', fontSize: '1.5rem'
      }}>
        Loading Bello...
      </div>
    );
  }

  return (
    <>
      <CssBaseline />
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
    </>
  );
}