// src/features/content/components/TestSeriesPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Layers, Trash2, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { testSeriesService } from '../services/testSeries.service';
import { TestSeriesSidebar } from './test-series/TestSeriesSidebar';
import { TestSettingsTab } from './test-series/TestSettingsTab';
import { BulkUploadTab } from './test-series/BulkUploadTab';
import { QuestionListTab } from './test-series/QuestionListTab';
import { useUIStore } from '../../../store/uiStore';
import type { CreateTestSeriesPayload } from '../types';

const MySwal = withReactContent(Swal);

export const TestSeriesPage: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  const [selectedTsId, setSelectedTsId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'upload' | 'settings'>('settings');

  const { data: tsData, isLoading } = useQuery({
    queryKey: ['testSeries', examId],
    queryFn: () => testSeriesService.getByExam(examId!),
    enabled: !!examId
  });

  const testSeriesList = tsData?.data || [];
  const selectedTs = testSeriesList.find(t => t.id === selectedTsId);
  const showDetailView = selectedTsId || isCreating;

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: testSeriesService.create,
    onSuccess: (res) => {
      addToast('Test Series created successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['testSeries', examId] });
      // Switch to the newly created test and open the questions tab
      setSelectedTsId(res.testSeries.id);
      setIsCreating(false);
      setActiveTab('questions');
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to create Test Series', 'error')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTestSeriesPayload> }) => testSeriesService.update(id, data),
    onSuccess: () => {
      addToast('Test Series settings updated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['testSeries', examId] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to update Test Series', 'error')
  });

  const handleSaveSettings = (data: CreateTestSeriesPayload) => {
    if (isCreating) {
      createMutation.mutate(data);
    } else if (selectedTsId) {
      updateMutation.mutate({ id: selectedTsId, data });
    }
  };

  const handleDeleteSeries = () => {
    if (!selectedTs) return;
    MySwal.fire({
      title: 'Delete Test Series?', text: `Cannot be undone. Are you sure?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ea580c', confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await testSeriesService.delete(selectedTs.id);
          MySwal.fire('Deleted!', 'Test Series has been deleted.', 'success');
          setSelectedTsId(null);
          navigate(0); // Quick refresh to clear state
        } catch(err: any) {
          addToast(err.response?.data?.error || 'Failed to delete', 'error');
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] -m-6 bg-surface">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 shrink-0 z-10">
        <button onClick={() => navigate('/content')} className="mr-3 sm:mr-4 p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Test Series Management</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <TestSeriesSidebar 
          testSeriesList={testSeriesList} isLoading={isLoading} selectedTsId={selectedTsId} isCreating={isCreating} showDetailView={!!showDetailView}
          onSelect={(id) => { setSelectedTsId(id); setIsCreating(false); setActiveTab('questions'); }}
          onCreateNew={() => { setIsCreating(true); setSelectedTsId(null); setActiveTab('settings'); }}
        />

        <div className={`
          flex-1 bg-white overflow-y-auto absolute md:static inset-0 z-10 transition-transform duration-300 ease-in-out
          ${showDetailView ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          
          <div className="md:hidden flex items-center px-4 py-3 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-20 backdrop-blur-sm">
            <button onClick={() => { setSelectedTsId(null); setIsCreating(false); }} className="flex items-center text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tests
            </button>
          </div>

          {!selectedTsId && !isCreating ? (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/30">
              <Layers className="w-16 h-16 mb-4 text-gray-200" />
              <p className="text-lg font-medium text-gray-500">Select a Test Series</p>
              <p className="text-sm mt-1">Or create a new one from the sidebar.</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24">
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {isCreating ? 'Create New Test Series' : selectedTs?.title}
                  </h2>
                  {!isCreating && (
                    <button onClick={handleDeleteSeries} className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors text-sm font-semibold flex items-center shrink-0 self-start">
                      <Trash2 className="w-4 h-4 mr-1.5" /> Delete Test
                    </button>
                  )}
                </div>
                
                {!isCreating && (
                  <div className="flex gap-4 sm:gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
                    <button onClick={() => setActiveTab('questions')} className={`text-sm font-semibold pb-2.5 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'questions' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Questions List</button>
                    <button onClick={() => setActiveTab('upload')} className={`text-sm font-semibold pb-2.5 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'upload' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Bulk Upload</button>
                    <button onClick={() => setActiveTab('settings')} className={`text-sm font-semibold pb-2.5 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>Test Settings</button>
                  </div>
                )}
              </div>

              {/* RENDER THE ACTIVE TAB */}
              {(isCreating || activeTab === 'settings') && (
                <TestSettingsTab 
                  selectedTs={selectedTs} 
                  isCreating={isCreating} 
                  examId={examId!} 
                  isPending={createMutation.isPending || updateMutation.isPending} 
                  onSubmit={handleSaveSettings} 
                />
              )}
              {!isCreating && activeTab === 'upload' && selectedTs && <BulkUploadTab selectedTs={selectedTs} />}
              {!isCreating && activeTab === 'questions' && selectedTs && <QuestionListTab selectedTs={selectedTs} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};