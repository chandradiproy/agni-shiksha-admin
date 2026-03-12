// src/components/layout/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { ErrorBoundary } from '../guard/ErrorBoundary';
import { Menu, Flame } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Automatically close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    // Changed to h-screen and overflow-hidden to lock viewport for the app shell layout
    <div className="flex h-screen bg-surface overflow-hidden">
      
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header (Hidden on Desktop) */}
        <div className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-2 text-primary">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Agni Shiksha</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:text-primary hover:bg-primary-light/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {/* Wrapping Outlet in ErrorBoundary ensures that if a specific page 
            crashes, the sidebar and app shell remain intact! 
          */}
          <ErrorBoundary>
            <div className="p-4 sm:p-6">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};