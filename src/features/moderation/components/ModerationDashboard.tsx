// src/features/moderation/components/ModerationDashboard.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader2, ShieldAlert, Filter, ChevronLeft, ChevronRight, CheckCircle, Search } from 'lucide-react';
import { moderationService } from '../services/moderation.service';
import { useUIStore } from '../../../store/uiStore';
import { DoubtCard } from './DoubtCard';
import { useDebounce } from '../../../hooks/useDebounce';

const MySwal = withReactContent(Swal);

export const ModerationDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'resolved' | 'unresolved'>('flagged');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // --- Queries ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ['moderation', page, filter, debouncedSearch],
    queryFn: () => moderationService.getDoubts(page, 20, filter, debouncedSearch),
    staleTime: 30000, 
  });

  // --- Mutations ---
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { is_resolved?: boolean; is_flagged?: boolean } }) => moderationService.updateDoubtStatus(id, data),
    onSuccess: () => {
      addToast('Status updated successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['moderation'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to update status', 'error')
  });

  const deleteDoubtMutation = useMutation({
    mutationFn: moderationService.deleteDoubt,
    onSuccess: () => {
      MySwal.fire('Deleted!', 'The toxic post and its answers have been removed.', 'success');
      queryClient.invalidateQueries({ queryKey: ['moderation'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete doubt', 'error')
  });

  // --- Handlers ---
  const handleUpdateStatus = (id: string, updateData: { is_resolved?: boolean; is_flagged?: boolean }) => {
    updateStatusMutation.mutate({ id, data: updateData });
  };

  const handleDeleteDoubt = (id: string, title: string) => {
    MySwal.fire({
      title: 'Delete this post?',
      text: `Are you sure you want to permanently delete "${title}" and all its answers?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c', // Agni Primary Orange
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDoubtMutation.mutate(id);
      }
    });
  };

  const doubts = data?.data || [];

  return (
    <div className="space-y-6 flex flex-col h-full pb-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-primary" />
            Community Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review flagged doubts, remove toxic content, and monitor forum health.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doubts..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm transition-shadow"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm w-full sm:w-auto shrink-0">
            <div className="px-3 flex items-center text-sm font-medium text-gray-500 border-r border-gray-200">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </div>
            <select 
              value={filter} 
              onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
              className="bg-transparent text-sm font-semibold text-gray-800 py-1.5 px-3 outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="flagged">🚨 Flagged Only</option>
              <option value="unresolved">❓ Unresolved</option>
              <option value="resolved">✅ Resolved</option>
              <option value="all">🌐 Show All Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-gray-500 text-sm">Loading community activity...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">
            Failed to load community content.
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-gray-700 font-medium text-lg">All clear!</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter === 'flagged' ? 'There are no flagged posts currently.' : 'No doubts match your current criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {doubts.map(doubt => (
              <DoubtCard 
                key={doubt.id} 
                doubt={doubt} 
                onDelete={handleDeleteDoubt}
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.pagination && data.pagination.totalPages > 1 && (
        <div className="bg-white px-6 py-3 border border-gray-200 rounded-xl flex items-center justify-between shadow-sm shrink-0">
          <span className="text-sm text-gray-500 font-medium">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};