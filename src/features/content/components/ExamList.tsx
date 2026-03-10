// src/features/content/components/ExamList.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Plus, Edit2, Trash2, FolderOpen, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { examService } from '../services/exam.service';
import { useDebounce } from '../../../hooks/useDebounce';
import { useUIStore } from '../../../store/uiStore';
import { ExamModal } from './ExamModal';
import type { Exam, CreateExamPayload } from '../types';
import { Authorize } from '../../../components/guard/Authorize';

const MySwal = withReactContent(Swal);

export const ExamList: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ['exams', page, debouncedSearch],
    queryFn: () => examService.getExams(page, 20, debouncedSearch),
    staleTime: 60000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: examService.createExam,
    onSuccess: () => {
      MySwal.fire({
        title: 'Success!',
        text: 'Exam created successfully.',
        icon: 'success',
        confirmButtonColor: '#ea580c'
      });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => addToast(error.response?.data?.message || error.response?.data?.error || 'Failed to create exam.', 'error')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExamPayload> }) => examService.updateExam(id, data),
    onSuccess: () => {
      MySwal.fire({
        title: 'Updated!',
        text: 'Exam details saved.',
        icon: 'success',
        confirmButtonColor: '#ea580c'
      });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setIsModalOpen(false);
      setEditingExam(null);
    },
    onError: (error: any) => addToast(error.response?.data?.message || error.response?.data?.error || 'Failed to update exam.', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: () => {
      MySwal.fire('Deleted!', 'The exam has been deleted.', 'success');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error: any) => addToast(error.response?.data?.message || error.response?.data?.error || 'Failed to delete exam.', 'error')
  });

  const handleOpenCreate = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: CreateExamPayload) => {
    if (editingExam) {
      updateMutation.mutate({ id: editingExam.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: `You are about to permanently delete "${name}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c', // Agni Primary
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum & Exams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage top-level exams and categories.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
          
          <Authorize allowedRoles={['super_admin', 'content_manager', 'content']}>
            <button 
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" /> New Exam
            </button>
          </Authorize>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-gray-500 text-sm">Loading curriculum...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">
            Failed to load exams. Please try again.
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
            <FolderOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No exams found.</p>
            <p className="text-gray-400 text-sm mt-1">Create your first exam to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((exam) => (
              <div key={exam.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden">
                    {exam.thumbnail_url ? (
                      <img src={exam.thumbnail_url} alt={exam.name} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                      exam.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {exam.is_active ? 'Active' : 'Inactive'}
                    </span>
                    
                    {/* Action Menu (Visible on hover) */}
                    <Authorize allowedRoles={['super_admin', 'content_manager', 'content']}>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => handleOpenEdit(exam)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exam.id, exam.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Authorize>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{exam.name}</h3>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1 mb-3">
                  {exam.category} • {exam.conducting_body}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">{exam.description}</p>
                
                <div className="flex gap-1 flex-wrap mb-4">
                  {exam.subjects?.slice(0, 2).map((sub, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">
                      {sub}
                    </span>
                  ))}
                  {exam.subjects?.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">
                      +{exam.subjects.length - 2} more
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">
                    Updated {new Date(exam.updated_at || exam.created_at).toLocaleDateString()}
                  </span>
                  
                  {/* Navigate to Test Series */}
                  <button 
                    onClick={() => navigate(`/content/exams/${exam.id}/test-series`)}
                    className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center bg-primary-light/50 hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Layers className="w-4 h-4 mr-1.5" /> Manage Tests
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ExamModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingExam(null); }}
        onSubmit={handleSubmit}
        initialData={editingExam}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};