import React from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Users, Activity, Target, ShieldCheck } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}. Here is what's happening today.</p>
      </div>

      {/* Stats Grid - Placeholder metrics to be connected to the API later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="124,500" icon={Users} trend="+12% this month" />
        <StatCard title="Active Tests" value="48" icon={Target} trend="2 pending review" />
        <StatCard title="API Requests (Azure)" value="2.4M" icon={Activity} trend="Within quota" />
        <StatCard title="Reported Doubts" value="15" icon={ShieldCheck} trend="Needs moderation" alert />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Activity & Analytics</h2>
        <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
          [ Azure PostgreSQL Analytics Chart Placeholder ]
        </div>
      </div>
    </div>
  );
};

// Internal sub-component for stats
const StatCard = ({ title, value, icon: Icon, trend, alert = false }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-4 text-sm">
      <span className={`${alert ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{trend}</span>
    </div>
  </div>
);