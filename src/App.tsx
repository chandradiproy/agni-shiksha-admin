// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './features/auth';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { UsersPage } from './features/users'; 
import { AdminLayout } from './components/layout/AdminLayout';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuthStore } from './store/authStore';

// Initialize the React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents excessive refetching when switching browser tabs
      retry: 1, // Only retry failed requests once by default
    },
  },
});

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />} 
          />

          {/* Protected Admin Routes */}
          <Route path="/" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<Dashboard />} />
            
            {/* Replaced placeholder with the actual component */}
            <Route path="users" element={<UsersPage />} />
            
            <Route path="content" element={<div className="p-6">Content Management (Coming Soon)</div>} />
            <Route path="news" element={<div className="p-6">Current Affairs (Coming Soon)</div>} />
            <Route path="moderation" element={<div className="p-6">Moderation (Coming Soon)</div>} />
            <Route path="gamification" element={<div className="p-6">Gamification (Coming Soon)</div>} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Toast UI */}
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;