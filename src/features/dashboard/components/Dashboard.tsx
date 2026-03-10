// src/features/dashboard/components/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Activity, Target, ShieldCheck, Loader2, UserPlus, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { dashboardService } from '../services/dashboard.service';
import type { RecentStudent } from '../types';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getStats,
    staleTime: 60000, // Cache for 1 minute to prevent spamming the read replica
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)] text-red-500 font-medium bg-red-50 rounded-xl border border-red-100 p-6">
        Failed to load dashboard metrics. Please check your connection or try again later.
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentStudents = data?.recentStudents || [];

  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}. Here is the latest system data.</p>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={metrics?.totalStudents.toLocaleString() || '0'} 
          icon={Users} 
        />
        <StatCard 
          title="Active Tests" 
          value={metrics?.activeTests.toLocaleString() || '0'} 
          icon={Target} 
        />
        <StatCard 
          title="Total Questions" 
          value={metrics?.totalQuestions.toLocaleString() || '0'} 
          icon={Activity} 
        />
        <StatCard 
          title="System Admins" 
          value={metrics?.totalAdmins.toLocaleString() || '0'} 
          icon={ShieldCheck} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area - Analytics Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">System Activity & Revenue</h2>
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <span className="font-medium text-sm">Azure PostgreSQL Analytics Chart Placeholder</span>
            <span className="text-xs mt-1">(Requires Recharts / Chart.js integration)</span>
          </div>
        </div>

        {/* Recent Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              Recent Signups
            </h2>
          </div>
          
          {recentStudents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
              No recent signups found.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {recentStudents.map((student: RecentStudent) => (
                  <div key={student.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {student.full_name ? student.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {student.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{student.email}</p>
                      <div className="flex items-center text-[10px] text-gray-400 mt-1 font-medium">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal sub-component for stats
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary-light transition-all group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className="p-3.5 rounded-xl bg-primary-light/50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);