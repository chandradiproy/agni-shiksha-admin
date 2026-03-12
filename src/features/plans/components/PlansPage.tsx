// src/features/plans/components/PlansPage.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, Crown, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { motion, AnimatePresence } from 'framer-motion';
import { planService } from '../services/plan.service';
import type { Plan, CreatePlanPayload } from '../types';
import { useUIStore } from '../../../store/uiStore';

const MySwal = withReactContent(Swal);

const planSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  slug: z.string().min(3, 'Slug is required'),
  monthly_price_inr: z.number().min(0, 'Cannot be negative'),
  annual_price_inr: z.number().min(0, 'Cannot be negative'),
  featuresText: z.string().min(3, 'Add at least one feature'),
  is_active: z.boolean().default(true),
  display_order: z.number().default(1)
});

type FormInputs = z.infer<typeof planSchema>;

export const PlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['plans'], queryFn: planService.getPlans });
  const plans = data?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({ resolver: zodResolver(planSchema) });

  useEffect(() => {
    if (isModalOpen) {
      if (editingPlan) {
        reset({
          name: editingPlan.name,
          slug: editingPlan.slug,
          monthly_price_inr: editingPlan.monthly_price_paise / 100,
          annual_price_inr: editingPlan.annual_price_paise / 100,
          featuresText: (editingPlan.features || []).join(', '),
          is_active: editingPlan.is_active,
          display_order: editingPlan.display_order
        });
      } else {
        reset({ name: '', slug: '', monthly_price_inr: 0, annual_price_inr: 0, featuresText: '', is_active: true, display_order: 1 });
      }
    }
  }, [isModalOpen, editingPlan, reset]);

  const saveMutation = useMutation({
    mutationFn: (payload: CreatePlanPayload) => editingPlan ? planService.updatePlan(editingPlan.id, payload) : planService.createPlan(payload),
    onSuccess: () => {
      addToast(`Plan ${editingPlan ? 'updated' : 'created'} successfully!`, 'success');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to save plan', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: planService.deletePlan,
    onSuccess: () => { MySwal.fire('Deleted!', 'Plan removed.', 'success'); queryClient.invalidateQueries({ queryKey: ['plans'] }); },
    onError: (err: any) => MySwal.fire('Cannot Delete', err.response?.data?.error || 'Action failed', 'error')
  });

  const onSubmit = (data: FormInputs) => {
    const payload: CreatePlanPayload = {
      name: data.name,
      slug: data.slug,
      monthly_price_paise: Math.round(data.monthly_price_inr * 100),
      annual_price_paise: Math.round(data.annual_price_inr * 100),
      features: data.featuresText.split(',').map(f => f.trim()).filter(f => f.length > 0),
      is_active: data.is_active,
      display_order: data.display_order
    };
    saveMutation.mutate(payload);
  };

  const confirmDelete = (plan: Plan) => {
    MySwal.fire({
      title: 'Delete this Plan?',
      text: "Only plans without active subscriptions can be fully deleted.",
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ea580c', confirmButtonText: 'Yes, delete it!'
    }).then(result => { if (result.isConfirmed) deleteMutation.mutate(plan.id); });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500">Manage premium offerings and pricing tiers.</p>
        </div>
        <button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Create Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white border rounded-2xl p-6 shadow-sm relative group ${plan.is_active ? 'border-primary-light hover:shadow-md' : 'border-gray-200 opacity-70'}`}>
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => confirmDelete(plan)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Crown className={`w-5 h-5 ${plan.is_active ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900">₹{(plan.monthly_price_paise / 100).toLocaleString()}</span>
                <span className="text-gray-500 text-sm font-medium">/mo</span>
                <p className="text-xs text-gray-400 font-semibold mt-1">or ₹{(plan.annual_price_paise / 100).toLocaleString()} /year</p>
              </div>
              
              <ul className="space-y-2 mt-4 border-t border-gray-100 pt-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface shrink-0">
                  <h2 className="text-lg font-bold text-gray-900">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Pro Plan" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug</label>
                        <input {...register('slug')} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="pro-plan" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monthly Price (₹)</label>
                        <input type="number" {...register('monthly_price_inr', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Annual Price (₹)</label>
                        <input type="number" {...register('annual_price_inr', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Features (Comma separated)</label>
                      <textarea {...register('featuresText')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="Mock tests, Video lectures, Mentorship" />
                    </div>
                    <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 text-primary rounded" />
                        <label htmlFor="is_active" className="ml-2 text-sm font-semibold">Active</label>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Order</span>
                        <input type="number" {...register('display_order', { valueAsNumber: true })} className="w-16 px-2 py-1 border border-gray-300 rounded outline-none text-sm inline-block" />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
                  <button type="submit" form="plan-form" disabled={saveMutation.isPending} className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-md disabled:opacity-70">
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Save Plan
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};