
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// Fix: Corrected import for AuthProvider. It is located in hooks/AuthContext.tsx.
import { AuthProvider } from './hooks/AuthContext';
import { useAuth } from './hooks/useAuth';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import RoomAllocation from './pages/RoomAllocation';
import FeesManagement from './pages/FeesManagement';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import PersonalDetails from './pages/PersonalDetails';
import NotFound from './pages/NotFound';
import type { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: UserRole[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark"><div className="text-xl font-semibold">Loading...</div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    return <Navigate to="/personal-details" replace />;
  }
  
  return children;
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark"><div className="text-xl font-semibold">Loading...</div></div>;
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            
            <Route path="/" element={
                <ProtectedRoute roles={['admin', 'student']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                    <ProtectedRoute roles={['admin']}>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="students" element={
                    <ProtectedRoute roles={['admin']}>
                        <StudentManagement />
                    </ProtectedRoute>
                } />
                <Route path="rooms" element={
                    <ProtectedRoute roles={['admin']}>
                        <RoomAllocation />
                    </ProtectedRoute>
                } />
                <Route path="fees" element={
                    <ProtectedRoute roles={['admin']}>
                        <FeesManagement />
                    </ProtectedRoute>
                } />
                <Route path="attendance" element={
                    <ProtectedRoute roles={['admin']}>
                        <Attendance />
                    </ProtectedRoute>
                } />
                <Route path="reports" element={
                    <ProtectedRoute roles={['admin']}>
                        <Reports />
                    </ProtectedRoute>
                } />
                <Route path="personal-details" element={
                    <ProtectedRoute roles={['admin', 'student']}>
                        <PersonalDetails />
                    </ProtectedRoute>
                } />
                <Route path="personal-details/:studentId" element={
                    <ProtectedRoute roles={['admin']}>
                        <PersonalDetails />
                    </ProtectedRoute>
                } />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;