// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Newspaper, 
  ShieldAlert, Award, LogOut, Flame, FileText,
  Crown, PenTool, FileEdit, ShieldCheck, PieChart
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { AdminRole } from '../../store/authStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  allowedRoles: AdminRole[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, allowedRoles: ['super_admin', 'content_manager', 'support_moderator', 'analytics_finance', 'content'] },
  { name: 'User Management', path: '/users', icon: Users, allowedRoles: ['super_admin', 'support_moderator', 'analytics_finance'] },
  { name: 'Curriculum & Content', path: '/content', icon: BookOpen, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Study Material', path: '/study', icon: FileText, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Current Affairs', path: '/news', icon: Newspaper, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Moderation Forum', path: '/moderation', icon: ShieldAlert, allowedRoles: ['super_admin', 'support_moderator'] },
  { name: 'Gamification', path: '/gamification', icon: Award, allowedRoles: ['super_admin', 'content_manager'] },
];

// Helper function to map roles to specific colors and icons
const getRoleBadge = (role?: AdminRole) => {
  switch (role) {
    case 'super_admin':
      return { icon: Crown, color: 'text-red-700 bg-red-50 border-red-200', label: 'Super Admin' };
    case 'content_manager':
      return { icon: PenTool, color: 'text-blue-700 bg-blue-50 border-blue-200', label: 'Content Manager' };
    case 'content':
      return { icon: FileEdit, color: 'text-purple-700 bg-purple-50 border-purple-200', label: 'Content Creator' };
    case 'support_moderator':
      return { icon: ShieldCheck, color: 'text-green-700 bg-green-50 border-green-200', label: 'Moderator' };
    case 'analytics_finance':
      return { icon: PieChart, color: 'text-teal-700 bg-teal-50 border-teal-200', label: 'Finance & Analytics' };
    default:
      return { icon: ShieldAlert, color: 'text-gray-700 bg-gray-50 border-gray-200', label: 'Admin' };
  }
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const roleBadge = getRoleBadge(user?.role);
  const RoleIcon = roleBadge.icon;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <Flame className="w-6 h-6 text-primary mr-2" />
        <span className="text-xl font-bold text-gray-900 tracking-tight">Agni Shiksha</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          // RBAC Layer B & C: Hide links they don't have access to
          if (user && !item.allowedRoles.includes(user.role)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
        <div className="mb-4 px-2">
          <p className="text-sm font-bold text-gray-900 truncate mb-1.5">{user?.name}</p>
          <div className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm ${roleBadge.color}`}>
            <RoleIcon className="w-3 h-3 mr-1" />
            {roleBadge.label}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};