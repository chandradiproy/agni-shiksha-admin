// src/features/study/components/AddTaskModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, PlusCircle, Save } from 'lucide-react';
import type { AddTaskPayload, StudyMaterial, StudyPlanTask } from '../types';

const taskSchema = z.object({
  day_number: z.number().min(1, 'Required'),
  task_title: z.string().min(3, 'Title is required'),
  task_description: z.string().optional(),
  reference_material_id: z.string().optional()
});

type FormInputs = z.infer<typeof taskSchema>;

export const AddTaskModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: AddTaskPayload) => void; 
  isPending: boolean; 
  planDuration: number; 
  planTitle: string;
  examId: string;
  materials: StudyMaterial[];
  initialData?: StudyPlanTask | null;
}> = ({ isOpen, onClose, onSubmit, isPending, planDuration, planTitle, examId, materials, initialData }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({ resolver: zodResolver(taskSchema) });

  useEffect(() => { 
    if (isOpen) {
      if (initialData) {
        reset({
          day_number: initialData.day_number,
          task_title: initialData.task_title,
          task_description: initialData.task_description || '',
          reference_material_id: initialData.reference_material_id || ''
        });
      } else {
        reset({ day_number: 1, task_title: '', task_description: '', reference_material_id: '' });
      }
    } 
  }, [isOpen, initialData, reset]);

  // FIX FOR UUID ERROR: Convert empty string to undefined so Prisma records a NULL
  const handleSafeSubmit = (data: FormInputs) => {
    const payload = {
      ...data,
      reference_material_id: data.reference_material_id === "" ? undefined : data.reference_material_id
    };
    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed h-screen inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 flex items-center justify-center  z-70 p-4 pointer-events-none bg-black/40">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface shrink-0">
                <h2 className="text-lg font-bold text-gray-900 truncate pr-4">
                  {initialData ? 'Edit Task' : `Add Task to ${planTitle}`}
                </h2>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors shrink-0"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="task-form" onSubmit={handleSubmit(handleSafeSubmit)} className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Day No. <span className="text-red-500">*</span></label>
                      <input type="number" max={planDuration} {...register('day_number', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder={`1-${planDuration}`} />
                      {errors.day_number && <p className="text-red-500 text-xs mt-1">{errors.day_number.message}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Task Title <span className="text-red-500">*</span></label>
                      <input {...register('task_title')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., Read Ancient India Ch. 1" />
                      {errors.task_title && <p className="text-red-500 text-xs mt-1">{errors.task_title.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Attach Study Material (Optional)</label>
                    <select {...register('reference_material_id')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white">
                      <option value="">No Attachment</option>
                      {materials.filter(m => m.exam_id === examId).map(m => (
                        <option key={m.id} value={m.id}>[{m.material_type}] {m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Instructions / Description</label>
                    <textarea {...register('task_description')} rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="What should the student focus on today?" />
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="task-form" disabled={isPending} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (initialData ? <Save className="w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />)} 
                  {initialData ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};