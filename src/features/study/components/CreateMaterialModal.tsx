// src/features/study/components/CreateMaterialModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, FileText, Save, Crown } from 'lucide-react';
import type { CreateMaterialPayload, StudyMaterial } from '../types';

const materialSchema = z.object({
  exam_id: z.string().min(1, 'Please select an exam'),
  title: z.string().min(3, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  material_type: z.enum(['PDF', 'VIDEO_LINK']),
  file_url: z.string().url('Must be a valid URL'),
  is_active: z.boolean().default(true),
  is_premium: z.boolean().default(false),
});

type FormInputs = z.infer<typeof materialSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMaterialPayload) => void;
  isPending: boolean;
  exams: any[];
  initialData?: StudyMaterial | null;
}

export const CreateMaterialModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isPending, exams, initialData }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(materialSchema),
    defaultValues: { material_type: 'PDF', is_active: true, is_premium: false }
  });

  useEffect(() => { 
    if (isOpen) {
      if (initialData) {
        reset({ ...initialData, material_type: initialData.material_type as any });
      } else {
        reset({ exam_id: '', title: '', subject: '', topic: '', material_type: 'PDF', file_url: '', is_active: true, is_premium: false });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed h-screen inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3"><FileText className="w-4 h-4 text-primary" /></div>
                  <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Study Material' : 'Upload Study Material'}</h2>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="material-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Target Exam <span className="text-red-500">*</span></label>
                      <select {...register('exam_id')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white">
                        <option value="">Select Exam...</option>
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                      </select>
                      {errors.exam_id && <p className="text-red-500 text-xs mt-1">{errors.exam_id.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type <span className="text-red-500">*</span></label>
                      <select {...register('material_type')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white">
                        <option value="PDF">PDF Document</option><option value="VIDEO_LINK">Video Link</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input {...register('title')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., Complete Ancient History Notes" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subject <span className="text-red-500">*</span></label>
                      <input {...register('subject')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., History" />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Topic <span className="text-red-500">*</span></label>
                      <input {...register('topic')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., Ancient India" />
                      {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">File URL / Video Link <span className="text-red-500">*</span></label>
                    <input {...register('file_url')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="https://..." />
                    {errors.file_url && <p className="text-red-500 text-xs mt-1">{errors.file_url.message}</p>}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <div className="flex-1 flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                      <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">Active (Visible)</label>
                    </div>
                    <div className="flex-1 flex items-center bg-yellow-50/50 p-4 rounded-xl border border-yellow-200">
                      <input type="checkbox" id="is_premium" {...register('is_premium')} className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-600" />
                      <label htmlFor="is_premium" className="ml-3 text-sm font-bold text-yellow-800 flex items-center cursor-pointer"><Crown className="w-4 h-4 mr-1.5"/> Premium Only</label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="material-form" disabled={isPending} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} {initialData ? 'Save Changes' : 'Upload Material'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};