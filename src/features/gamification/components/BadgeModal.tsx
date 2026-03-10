// src/features/gamification/components/BadgeModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save, Award } from 'lucide-react';
import type { CreateBadgePayload, Badge } from '../types';

const badgeSchema = z.object({
  badge_name: z.string().min(3, 'Badge name is required'),
  description: z.string().min(5, 'Description is required'),
  icon_url: z.string().url('Must be a valid URL'),
  unlock_xp_threshold: z.number().min(1, 'Threshold must be greater than 0'),
});

type FormInputs = z.infer<typeof badgeSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBadgePayload) => void;
  isPending: boolean;
  initialData?: Badge | null;
}

export const BadgeModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isPending, initialData }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(badgeSchema)
  });

  useEffect(() => { 
    if (isOpen) {
      if (initialData) {
        reset({
          badge_name: initialData.badge_name,
          description: initialData.description,
          icon_url: initialData.icon_url,
          unlock_xp_threshold: initialData.unlock_xp_threshold,
        });
      } else {
        reset({ badge_name: '', description: '', icon_url: '', unlock_xp_threshold: 1000 });
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
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3"><Award className="w-4 h-4 text-yellow-600" /></div>
                  <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Badge' : 'Create New Badge'}</h2>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="badge-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Badge Name <span className="text-red-500">*</span></label>
                    <input {...register('badge_name')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., Grandmaster" />
                    {errors.badge_name && <p className="text-red-500 text-xs mt-1">{errors.badge_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea {...register('description')} rows={2} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="e.g., Awarded for reaching 10,000 XP" />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Unlock XP Threshold <span className="text-red-500">*</span></label>
                    <input type="number" {...register('unlock_xp_threshold', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., 10000" />
                    {errors.unlock_xp_threshold && <p className="text-red-500 text-xs mt-1">{errors.unlock_xp_threshold.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Icon URL (Azure CDN) <span className="text-red-500">*</span></label>
                    <input {...register('icon_url')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="https://cdn.agnishiksha.com/badges/..." />
                    {errors.icon_url && <p className="text-red-500 text-xs mt-1">{errors.icon_url.message}</p>}
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="badge-form" disabled={isPending} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} {initialData ? 'Save Changes' : 'Create Badge'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};