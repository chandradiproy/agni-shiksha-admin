// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Newspaper, 
  ShieldAlert, Award, LogOut, Flame, FileText,
  Crown, PenTool, FileEdit, ShieldCheck, PieChart, CreditCard, Shield, X, Bell, FolderTree
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { AdminRole } from '../../store/authStore';

// ADDED: Props interface for mobile control
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, allowedRoles: ['super_admin', 'content_manager', 'support_moderator', 'analytics_finance', 'content'] },
  { name: 'User Management', path: '/users', icon: Users, allowedRoles: ['super_admin', 'support_moderator', 'analytics_finance'] },
  { name: 'Curriculum & Content', path: '/content', icon: BookOpen, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Exam Categories', path: '/content/categories', icon: FolderTree, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Study Material', path: '/study', icon: FileText, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Current Affairs', path: '/news', icon: Newspaper, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Gamification', path: '/gamification', icon: Award, allowedRoles: ['super_admin', 'content_manager'] },
  { name: 'Marketing & Alerts', path: '/notifications', icon: Bell, allowedRoles: ['super_admin'] },
  
  // SYSTEM MODULES
  { name: 'Subscription Plans', path: '/plans', icon: Crown, allowedRoles: ['super_admin'] },
  { name: 'Financial Ledger', path: '/financial', icon: CreditCard, allowedRoles: ['super_admin', 'analytics_finance'] },
  { name: 'Moderation Forum', path: '/moderation', icon: ShieldAlert, allowedRoles: ['super_admin', 'support_moderator'] },
  { name: 'Audit Logs', path: '/audit', icon: Shield, allowedRoles: ['super_admin'] },
];

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  allowedRoles: AdminRole[];
}

const getRoleBadge = (role?: AdminRole) => {
  switch (role) {
    case 'super_admin': return { icon: Crown, color: 'text-red-700 bg-red-50 border-red-200', label: 'Super Admin' };
    case 'content_manager': return { icon: PenTool, color: 'text-blue-700 bg-blue-50 border-blue-200', label: 'Content Manager' };
    case 'content': return { icon: FileEdit, color: 'text-purple-700 bg-purple-50 border-purple-200', label: 'Content Creator' };
    case 'support_moderator': return { icon: ShieldCheck, color: 'text-green-700 bg-green-50 border-green-200', label: 'Moderator' };
    case 'analytics_finance': return { icon: PieChart, color: 'text-teal-700 bg-teal-50 border-teal-200', label: 'Finance & Analytics' };
    default: return { icon: ShieldAlert, color: 'text-gray-700 bg-gray-50 border-gray-200', label: 'Admin' };
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const roleBadge = getRoleBadge(user?.role);
  const RoleIcon = roleBadge.icon;

  return (
    <>
      {/* Mobile Dark Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 
          w-64 bg-white border-r border-gray-200 
          flex flex-col h-full shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center">
            <Flame className="w-6 h-6 text-primary mr-2" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Agni Shiksha</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            if (user && !item.allowedRoles.includes(user.role)) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // Auto-close drawer on link click
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          <button onClick={logout} className="w-full flex items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};