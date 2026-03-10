// src/features/study/components/CreatePlanModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, CalendarDays, Save } from 'lucide-react';
import type { CreatePlanPayload, StudyPlan } from '../types';

const planSchema = z.object({
  exam_id: z.string().min(1, 'Please select an exam'),
  title: z.string().min(3, 'Title is required'),
  duration_days: z.number().min(1, 'Must be at least 1 day').max(365, 'Cannot exceed 1 year'),
});

type FormInputs = z.infer<typeof planSchema>;

export const CreatePlanModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: CreatePlanPayload) => void; isPending: boolean; exams: any[]; initialData?: StudyPlan | null }> = ({ isOpen, onClose, onSubmit, isPending, exams, initialData }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({ resolver: zodResolver(planSchema) });

  useEffect(() => { 
    if (isOpen) {
      if (initialData) {
        reset({ exam_id: initialData.exam_id, title: initialData.title, duration_days: initialData.duration_days });
      } else {
        reset({ exam_id: '', title: '', duration_days: 30 });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white  rounded-2xl shadow-xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3"><CalendarDays className="w-4 h-4 text-primary" /></div>
                  <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Study Plan' : 'Create Study Plan'}</h2>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Target Exam <span className="text-red-500">*</span></label>
                    <select {...register('exam_id')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white">
                      <option value="">Select Exam...</option>
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                    {errors.exam_id && <p className="text-red-500 text-xs mt-1">{errors.exam_id.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Plan Title <span className="text-red-500">*</span></label>
                    <input {...register('title')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., 30 Days to SSC CGL Mastery" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Duration (Days) <span className="text-red-500">*</span></label>
                    <input type="number" {...register('duration_days', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., 30" />
                    {errors.duration_days && <p className="text-red-500 text-xs mt-1">{errors.duration_days.message}</p>}
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="plan-form" disabled={isPending} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} {initialData ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};