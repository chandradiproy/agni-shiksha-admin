import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Newspaper, 
  ShieldAlert, Award, LogOut, Flame 
} from 'lucide-react';
import { useAuthStore, type AdminRole } from '../../store/authStore';

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
  { name: 'Current Affairs', path: '/news', icon: Newspaper, allowedRoles: ['super_admin', 'content_manager', 'content'] },
  { name: 'Moderation Forum', path: '/moderation', icon: ShieldAlert, allowedRoles: ['super_admin', 'support_moderator'] },
  { name: 'Gamification', path: '/gamification', icon: Award, allowedRoles: ['super_admin', 'content_manager', 'content'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
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

      <div className="p-4 border-t border-gray-100">
        <div className="mb-4 px-3">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};