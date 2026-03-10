// src/features/content/components/test-series/QuestionListTab.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader2, Trash2, CheckCircle2, Lock, Edit2 } from 'lucide-react';
import { questionService } from '../../services/question.service';
import { useUIStore } from '../../../../store/uiStore';
import type { TestSeries } from '../../types';
import { QuestionEditModal } from './QuestionEditModal';

const MySwal = withReactContent(Swal);

export const QuestionListTab: React.FC<{ selectedTs: TestSeries }> = ({ selectedTs }) => {
  const addToast = useUIStore(state => state.addToast);
  const queryClient = useQueryClient();

  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['questions', selectedTs.id],
    queryFn: () => questionService.getQuestions(selectedTs.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) => questionService.deleteQuestion(selectedTs.id, questionId),
    onSuccess: () => {
      MySwal.fire('Deleted!', 'The question was removed.', 'success');
      queryClient.invalidateQueries({ queryKey: ['questions', selectedTs.id] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete question', 'error')
  });

  const handleDelete = (id: string) => {
    if (selectedTs.is_published) {
      addToast("Cannot modify questions on a published test.", "error");
      return;
    }
    MySwal.fire({
      title: 'Delete Question?', text: `This cannot be undone.`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ea580c', confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (isError) return <div className="text-red-500 text-center p-8">Failed to load questions.</div>;
  
  const questions = data?.data || [];

  return (
    <div className="animate-in fade-in pb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center">
          Uploaded Questions <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{questions.length} Total</span>
        </h3>
        {selectedTs.is_published && (
          <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full flex items-center">
            <Lock className="w-3 h-3 mr-1"/> Read Only (Published)
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600 w-12 text-center">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Question Data</th>
              <th className="px-4 py-3 font-semibold text-gray-600 w-24 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map((q: any, index: number) => (
              <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 text-gray-400 font-medium text-center align-top">{index + 1}</td>
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{q.subject}</span>
                    <span className="bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded text-[10px] font-semibold">{q.topic}</span>
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold capitalize">{q.difficulty}</span>
                  </div>
                  
                  <p className="text-gray-900 font-medium text-sm mb-3 leading-relaxed">{q.question_text}</p>
                  
                  {/* Clean Options Render matching your image */}
                  <div className="space-y-1.5 max-w-md">
                    {q.options?.map((opt: any) => (
                      <div key={opt.id} className={`flex items-center text-sm px-3 py-2 rounded-md transition-colors ${
                        opt.is_correct 
                          ? 'bg-green-50 border border-green-200 text-green-800 font-medium' 
                          : 'bg-gray-50 border border-transparent text-gray-600'
                      }`}>
                        <span className="uppercase font-bold w-6 text-gray-400">{opt.id}.</span>
                        <span className="flex-1">{opt.text}</span>
                        {opt.is_correct && <CheckCircle2 className="w-4 h-4 ml-2 text-green-600 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </td>
                
                <td className="px-4 py-4 align-top text-right">
                  {!selectedTs.is_published && (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingQuestion(q)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                  No questions uploaded yet. Use the Bulk Upload tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <QuestionEditModal 
        isOpen={!!editingQuestion} 
        onClose={() => setEditingQuestion(null)} 
        question={editingQuestion} 
        testSeriesId={selectedTs.id} 
      />
    </div>
  );
};