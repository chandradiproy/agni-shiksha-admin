import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './features/auth';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { UsersPage } from './features/users';
import { ContentPage } from './features/content'; 
import { TestSeriesPage } from './features/content/components/TestSeriesPage';
import { NewsPage } from './features/news'; // <--- Import NewsPage
import { StudyPage } from './features/study'; // <--- Import StudyPage
import { ModerationDashboard } from './features/moderation/components/ModerationDashboard';
import { GamificationPage } from './features/gamification';
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
            
            {/* User Management */}
            <Route path="users" element={<UsersPage />} />
            
            {/* Content & Curriculum */}
            <Route path="content" element={<ContentPage />} />
            <Route path="content/exams/:examId/test-series" element={<TestSeriesPage />} />
            
            {/* Study Module */}
            <Route path="study" element={<StudyPage />} />
            
            {/* Current Affairs / News Module */}
            <Route path="news" element={<NewsPage />} />
            
            {/* Placeholders for future modules */}
            <Route path="moderation" element={<ModerationDashboard />} />
            <Route path="gamification" element={<GamificationPage />} />
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