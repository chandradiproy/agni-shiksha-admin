// src/features/users/components/UserList.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService } from '../services/user.service';
import { useDebounce } from '../../../hooks/useDebounce';
import { useUIStore } from '../../../store/uiStore';
import { UserDrawer } from './UserDrawer';
import { type User } from '../types';

export const UserList: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, debouncedSearch],
    queryFn: () => userService.getUsers(page, 50, debouncedSearch),
    staleTime: 60000,
  });

  const banMutation = useMutation({
    mutationFn: userService.banUser,
    onSuccess: () => {
      addToast('User ban status updated successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Close drawer on success, or we could manually update the selectedUser state
      setSelectedUser(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Failed to update user.', 'error');
    }
  });

  const forumBanMutation = useMutation({
    mutationFn: userService.forumBanUser,
    onSuccess: () => {
      addToast('User forum privileges updated.', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Failed to update user.', 'error');
    }
  });

  const revokeSessionMutation = useMutation({
    mutationFn: userService.revokeUserSessions,
    onSuccess: (data: any) => {
      addToast(data.message || 'All sessions revoked. User has been logged out globally.', 'success');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Failed to revoke user sessions.', 'error');
    }
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and moderate student accounts.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading users from Azure...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-500 text-sm">
                    Failed to load users. Please try again.
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                data?.data?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs mr-3">
                          {user.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{user.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone_number || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col gap-1 items-start">
                        {user.is_banned ? (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-red-100 text-red-700 rounded text-center">Banned</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-green-100 text-green-700 rounded text-center">Active</span>
                        )}
                        {/* Now checks the updated forum_banned key */}
                        {user.forum_banned && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-orange-100 text-orange-700 rounded text-center mt-1">Forum Banned</span>
                        )}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="bg-surface px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-900">{data.pagination.page}</span> of <span className="font-medium text-gray-900">{data.pagination.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <UserDrawer 
        user={selectedUser} 
        isOpen={selectedUser !== null} 
        onClose={() => setSelectedUser(null)} 
        onBan={(id, reason) => banMutation.mutate({ id, reason })}
        onForumBan={(id) => forumBanMutation.mutate(id)}
        onRevokeSessions={(id) => revokeSessionMutation.mutate(id)}
        isActionLoading={banMutation.isPending || forumBanMutation.isPending || revokeSessionMutation.isPending}
      />
    </div>
  );
};