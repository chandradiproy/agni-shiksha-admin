// src/features/news/components/NewsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader2, Plus, RefreshCw, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { newsService } from '../services/news.service';
import { useUIStore } from '../../../store/uiStore';
import { ArticleCard } from './ArticleCard';
import { CreateArticleModal } from './CreateArticleModal';
import type { CreateCustomArticlePayload } from '../types';
import { Authorize } from '../../../components/guard/Authorize';

const MySwal = withReactContent(Swal);

export const NewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);
  
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Queries ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news', page],
    queryFn: () => newsService.getArticles(page, 15),
    staleTime: 60000,
  });

  // --- Mutations ---
  const syncMutation = useMutation({
    mutationFn: newsService.triggerSync,
    onSuccess: () => {
      addToast('News sync triggered successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: () => addToast('Failed to trigger news sync', 'error')
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { is_hidden?: boolean, is_pinned?: boolean } }) => newsService.updateStatus(id, data),
    onSuccess: () => {
      addToast('Article status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: () => addToast('Failed to update article status', 'error')
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCustomArticlePayload) => newsService.createCustomArticle(payload),
    onSuccess: () => {
      addToast('Custom article published!', 'success');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: () => addToast('Failed to publish custom article', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: newsService.deleteArticle,
    onSuccess: () => {
      MySwal.fire('Deleted!', 'The article was permanently removed.', 'success');
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: () => addToast('Failed to delete article', 'error')
  });

  // --- Handlers ---
  const handleToggleHide = (id: string, currentStatus: boolean) => {
    statusMutation.mutate({ id, data: { is_hidden: !currentStatus } });
  };

  const handleTogglePin = (id: string, currentStatus: boolean) => {
    statusMutation.mutate({ id, data: { is_pinned: !currentStatus } });
  };

  const handleDelete = (id: string, title: string) => {
    MySwal.fire({
      title: 'Delete Article?',
      text: `Are you sure you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full pb-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Affairs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage AI-scraped news and publish custom articles.</p>
        </div>
        
        <Authorize allowedRoles={['super_admin', 'content_manager']}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} /> 
              {syncMutation.isPending ? 'Syncing...' : 'Sync AI News'}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Write Article
            </button>
          </div>
        </Authorize>
      </div>

      {/* Grid Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-gray-500 text-sm">Loading articles...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">
            Failed to load news articles. Please try again.
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
            <Newspaper className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No articles found.</p>
            <p className="text-gray-400 text-sm mt-1">Trigger an AI sync or write a custom article.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onToggleHide={handleToggleHide} 
                onTogglePin={handleTogglePin} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.pagination && data.pagination.totalPages > 1 && (
        <div className="bg-white px-6 py-3 border border-gray-200 rounded-xl flex items-center justify-between shadow-sm">
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

      {/* Create Modal */}
      <CreateArticleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        isPending={createMutation.isPending}
      />
    </div>
  );
};