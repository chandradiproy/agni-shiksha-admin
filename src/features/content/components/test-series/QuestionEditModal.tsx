// src/features/content/components/test-series/QuestionEditModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '../../services/question.service';
import { useUIStore } from '../../../../store/uiStore';

const questionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  section: z.string().min(1, 'Section is required'),
  question_text: z.string().min(5, 'Question text must be at least 5 characters'),
  option_a: z.string().min(1, 'Option A is required'),
  option_b: z.string().min(1, 'Option B is required'),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_option: z.enum(['a', 'b', 'c', 'd']),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().min(1)
});

type FormInputs = z.infer<typeof questionSchema>;

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  testSeriesId: string;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({ isOpen, onClose, question, testSeriesId }) => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(questionSchema)
  });

  useEffect(() => {
    if (isOpen && question) {
      reset({
        subject: question.subject,
        topic: question.topic,
        section: question.section,
        question_text: question.question_text,
        option_a: question.options?.find((o: any) => o.id === 'a')?.text || '',
        option_b: question.options?.find((o: any) => o.id === 'b')?.text || '',
        option_c: question.options?.find((o: any) => o.id === 'c')?.text || '',
        option_d: question.options?.find((o: any) => o.id === 'd')?.text || '',
        correct_option: question.correct_option_id,
        explanation: question.explanation || '',
        difficulty: question.difficulty,
        marks: question.marks
      });
    }
  }, [isOpen, question, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: FormInputs) => questionService.updateQuestion(testSeriesId, question.id, data),
    onSuccess: () => {
      addToast('Question updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['questions', testSeriesId] });
      onClose();
    },
    onError: (error: any) => addToast(error.response?.data?.error || 'Failed to update question', 'error')
  });

  const onSubmit = (data: FormInputs) => {
    updateMutation.mutate(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Edit Question</h2>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="question-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                      <input {...register('subject')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
                      <input {...register('topic')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section</label>
                      <input {...register('section')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Text</label>
                    <textarea {...register('question_text')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm resize-none" />
                    {errors.question_text && <p className="text-red-500 text-xs mt-1">{errors.question_text.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option A</label>
                      <input {...register('option_a')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option B</label>
                      <input {...register('option_b')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option C</label>
                      <input {...register('option_c')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Option D</label>
                      <input {...register('option_d')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correct Option</label>
                      <select {...register('correct_option')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white">
                        <option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Difficulty</label>
                      <select {...register('difficulty')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white">
                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marks</label>
                      <input type="number" {...register('marks', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Explanation</label>
                    <textarea {...register('explanation')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm resize-none" />
                  </div>

                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="question-edit-form" disabled={updateMutation.isPending} className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};