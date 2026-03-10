// src/features/gamification/components/QuestModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save, Target } from 'lucide-react';
import type { CreateQuestPayload, Quest } from '../types';

const questSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description needs to be longer'),
  xp_reward: z.number().min(1, 'XP reward must be greater than 0'),
  target_action: z.string().min(1, 'Target action is required'),
  target_count: z.number().min(1, 'Target count must be at least 1'),
  is_active: z.boolean().default(true),
});

type FormInputs = z.infer<typeof questSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuestPayload) => void;
  isPending: boolean;
  initialData?: Quest | null;
}

export const QuestModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isPending, initialData }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(questSchema),
    defaultValues: { is_active: true, xp_reward: 50, target_count: 1, target_action: 'TAKE_TEST' }
  });

  useEffect(() => { 
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description,
          xp_reward: initialData.xp_reward,
          target_action: initialData.target_action,
          target_count: initialData.target_count,
          is_active: initialData.is_active,
        });
      } else {
        reset({ is_active: true, xp_reward: 50, target_count: 1, target_action: 'TAKE_TEST', title: '', description: '' });
      }
    } 
  }, [isOpen, initialData, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3"><Target className="w-4 h-4 text-primary" /></div>
                  <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Quest' : 'Create New Quest'}</h2>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="quest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Quest Title <span className="text-red-500">*</span></label>
                    <input {...register('title')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., The Scholar" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea {...register('description')} rows={2} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="e.g., Complete 5 mock tests" />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Target Action <span className="text-red-500">*</span></label>
                      <select {...register('target_action')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white">
                        <option value="TAKE_TEST">Take Test</option>
                        <option value="READ_ARTICLE">Read Article</option>
                        <option value="ASK_DOUBT">Ask Doubt</option>
                        <option value="DAILY_LOGIN">Daily Login</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Target Count <span className="text-red-500">*</span></label>
                      <input type="number" {...register('target_count', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
                      {errors.target_count && <p className="text-red-500 text-xs mt-1">{errors.target_count.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">XP Reward <span className="text-red-500">*</span></label>
                    <input type="number" {...register('xp_reward', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., 100" />
                    {errors.xp_reward && <p className="text-red-500 text-xs mt-1">{errors.xp_reward.message}</p>}
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
                    <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                    <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer">Quest is Active</label>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="quest-form" disabled={isPending} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} {initialData ? 'Save Changes' : 'Create Quest'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};