// src/features/content/components/CategoryList.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Plus, Edit2, Trash2, FolderOpen, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { categoryService } from '../services/category.service';
import { useUIStore } from '../../../store/uiStore';
import { CategoryModal } from './CategoryModal';
import type { ExamCategory, CreateCategoryPayload } from '../types';
import { Authorize } from '../../../components/guard/Authorize';

const MySwal = withReactContent(Swal);

export const CategoryList: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExamCategory | null>(null);

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 60000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      addToast('Category created successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => addToast(error.response?.data?.error || 'Failed to create category.', 'error')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryPayload> }) => categoryService.update(id, data),
    onSuccess: () => {
      addToast('Category updated.', 'success');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error: any) => addToast(error.response?.data?.error || 'Failed to update category.', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      MySwal.fire('Deleted!', 'The category has been deleted.', 'success');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => addToast(error.response?.data?.error || 'Failed to delete category.', 'error')
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: ExamCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: CreateCategoryPayload) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    MySwal.fire({
      title: 'Delete Category?',
      text: `You are about to delete "${name}". This is permanently blocked if Test Series are assigned to it.`,
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

  const filteredCategories = data?.data?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full bg-surface p-6 -m-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Exam Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage top-level filters like UPSC, SSC, Banking.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
          
          <Authorize allowedRoles={['super_admin', 'content_manager']}>
            <button 
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </button>
          </Authorize>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-gray-500 text-sm">Loading categories...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">
            Failed to load categories. Please try again.
          </div>
        ) : !filteredCategories || filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
            <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                      category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Action Menu (Visible on hover) */}
                  <Authorize allowedRoles={['super_admin', 'content_manager']}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-white">
                      <button onClick={() => handleOpenEdit(category)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)} 
                        className={`p-1.5 rounded ${category._count?.test_series ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        disabled={!!category._count?.test_series && category._count.test_series > 0}
                        title={category._count?.test_series ? "Cannot delete category with active test series" : "Delete category"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Authorize>
                </div>
                
                <h3 className="font-bold text-gray-900 text-xl">{category.name}</h3>
                <p className="text-sm font-mono text-gray-500 mb-4 mt-1 bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-100 self-start">
                  /{category.slug}
                </p>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm font-semibold text-gray-600">
                    <Layers className="w-4 h-4 mr-1.5 text-primary" />
                    {category._count?.test_series || 0} Tests
                  </div>
                </div>
                
                {/* Background Decorator */}
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none">
                  <Layers className="w-32 h-32" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleSubmit}
        initialData={editingCategory}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
