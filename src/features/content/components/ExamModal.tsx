// src/features/content/components/ExamModal.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, BookOpen, ChevronRight, ChevronLeft, Plus, Trash2, LayoutList, Eye, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { CreateExamPayload, Exam } from '../types';
import { categoryService } from '../services/category.service';

// --- Zod Schemas ---
const sectionSchema = z.object({
  subject: z.string().min(1, 'Subject required'),
  questions: z.number().min(1, 'Required'),
  marks: z.number().min(1, 'Required'),
});

const tierDetailSchema = z.object({
  tier_name: z.string().min(1, 'Tier name required'),
  duration_minutes: z.number().min(1, 'Required'),
  total_questions: z.number().min(1, 'Required'),
  total_marks: z.number().min(1, 'Required'),
  negative_marking: z.string().min(1, 'Required'),
  sections: z.array(sectionSchema).default([]),
}).superRefine((data, ctx) => {
  if (data.sections.length > 0) {
    const sumQs = data.sections.reduce((sum, sec) => sum + (sec.questions || 0), 0);
    if (sumQs !== data.total_questions) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Sum of sections (${sumQs}) ≠ ${data.total_questions}`, path: ['total_questions'] });
    }
    const sumMarks = data.sections.reduce((sum, sec) => sum + (sec.marks || 0), 0);
    if (sumMarks !== data.total_marks) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Sum of sections (${sumMarks}) ≠ ${data.total_marks}`, path: ['total_marks'] });
    }
  }
});

const examPatternSchema = z.object({
  exam_mode: z.string().min(1, 'Exam mode required'),
  selection_stages: z.array(z.object({ value: z.string().min(1, 'Stage required') })).default([]),
  tier_details: z.array(tierDetailSchema).default([]),
});

const examSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required (e.g., ssc-cgl-2026)'),
  category: z.string().min(2, 'Category is required'),
  conducting_body: z.string().min(2, 'Conducting body is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  display_order: z.number().int().min(1, 'Order must be 1 or higher'),
  thumbnail_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean(),
  subjects: z.array(z.object({ value: z.string().min(1, "Subject cannot be empty") })),
  exam_pattern: examPatternSchema,
});

type FormInputs = z.infer<typeof examSchema>;

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExamPayload) => void;
  initialData?: Exam | null;
  isLoading: boolean;
}

const TierSectionsFieldArray = ({ nestIndex, control, register, errors }: any) => {
  const { fields, append, remove } = useFieldArray({ control, name: `exam_pattern.tier_details.${nestIndex}.sections` });
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-semibold text-gray-700">Tier Sections / Subjects</label>
        <button type="button" onClick={() => append({ subject: '', questions: 0, marks: 0 })} className="text-xs text-primary font-semibold flex items-center hover:text-primary-hover">
          <Plus className="w-3 h-3 mr-1" /> Add Section
        </button>
      </div>
      {fields.length === 0 && <p className="text-xs text-gray-400 italic">No sections added to this tier yet.</p>}
      <div className="space-y-2">
        {fields.map((item, index) => {
          const sectionErrors = errors?.exam_pattern?.tier_details?.[nestIndex]?.sections?.[index];
          return (
            <div key={item.id} className="flex gap-2 items-start bg-white p-2 border border-gray-100 rounded-md">
              <div className="flex-1">
                <input {...register(`exam_pattern.tier_details.${nestIndex}.sections.${index}.subject`)} placeholder="Subject Name" className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" />
                {sectionErrors?.subject && <p className="text-red-500 text-[10px] mt-0.5">{sectionErrors.subject.message}</p>}
              </div>
              <div className="w-20">
                <input type="number" {...register(`exam_pattern.tier_details.${nestIndex}.sections.${index}.questions`, { valueAsNumber: true })} placeholder="Qs" className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" />
                {sectionErrors?.questions && <p className="text-red-500 text-[10px] mt-0.5">{sectionErrors.questions.message}</p>}
              </div>
              <div className="w-20">
                <input type="number" {...register(`exam_pattern.tier_details.${nestIndex}.sections.${index}.marks`, { valueAsNumber: true })} placeholder="Marks" className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" />
                {sectionErrors?.marks && <p className="text-red-500 text-[10px] mt-0.5">{sectionErrors.marks.message}</p>}
              </div>
              <button type="button" onClick={() => remove(index)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(1);

  const { register, control, watch, reset, trigger, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(examSchema),
    defaultValues: { is_active: true, display_order: 1 }
  });

  const formData = watch(); // We use this specifically for Step 4 Preview

  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({ control, name: "subjects" });
  const { fields: stagesFields, append: appendStage, remove: removeStage } = useFieldArray({ control, name: "exam_pattern.selection_stages" });
  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({ control, name: "exam_pattern.tier_details" });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 60000,
  });
  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialData) {
        reset({
          name: initialData.name, slug: initialData.slug, category: initialData.category, conducting_body: initialData.conducting_body,
          description: initialData.description || '', display_order: initialData.display_order, thumbnail_url: initialData.thumbnail_url || '',
          is_active: initialData.is_active,
          subjects: initialData.subjects?.length ? initialData.subjects.map(s => ({ value: s })) : [{ value: '' }],
          exam_pattern: {
            exam_mode: initialData.exam_pattern?.exam_mode || '',
            selection_stages: initialData.exam_pattern?.selection_stages?.map((s: string) => ({ value: s })) || [],
            tier_details: initialData.exam_pattern?.tier_details || []
          }
        });
      } else {
        reset({ 
          name: '', slug: '', category: '', conducting_body: '', description: '', thumbnail_url: '', is_active: true, display_order: 1,
          subjects: [{ value: '' }],
          exam_pattern: { exam_mode: 'Computer Based Test (CBT)', selection_stages: [{ value: 'Tier-I (Prelims)' }], tier_details: [] }
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleNext = async () => {
    let fieldsToValidate: any = [];
    if (step === 1) fieldsToValidate = ['name', 'slug', 'category', 'conducting_body', 'display_order', 'thumbnail_url'];
    if (step === 2) fieldsToValidate = ['description', 'subjects'];
    if (step === 3) fieldsToValidate = ['exam_pattern'];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep(s => s + 1);
  };

  const onFinalSubmit = () => {
    const payload: CreateExamPayload = {
      name: formData.name, slug: formData.slug, category: formData.category, conducting_body: formData.conducting_body,
      description: formData.description, thumbnail_url: formData.thumbnail_url || undefined, display_order: formData.display_order,
      is_active: formData.is_active,
      subjects: formData.subjects.map(s => s.value),
      exam_pattern: {
        exam_mode: formData.exam_pattern.exam_mode,
        selection_stages: formData.exam_pattern.selection_stages.map(s => s.value),
        tier_details: formData.exam_pattern.tier_details
      }
    };
    onSubmit(payload);
  };

  // ULTIMATE BUG FIX: Intercept Enter key to stop all auto-submissions inside the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Only allow Enter key inside Textareas
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          
          <div className="fixed inset-0 flex items-center justify-center  z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`bg-white rounded-2xl shadow-xl w-full transition-all duration-300 overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] ${step === 4 ? 'max-w-4xl' : 'max-w-3xl'}`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface shrink-0">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-none">{initialData ? 'Edit Exam' : 'Create New Exam'}</h2>
                    <p className="text-xs text-gray-500 mt-1">Step {step} of {TOTAL_STEPS}</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full h-1 bg-gray-100 shrink-0">
                <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                <form id="exam-wizard-form" onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown}>
                  
                  {step === 1 && (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Name <span className="text-red-500">*</span></label>
                         <input {...register('name')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., SSC CGL 2026" />
                         {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
                         <input {...register('slug')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., ssc-cgl-2026" />
                         {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                         <select {...register('category')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white">
                            <option value="">-- Select Master Category --</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                         </select>
                         {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1">Conducting Body <span className="text-red-500">*</span></label>
                         <input {...register('conducting_body')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., Staff Selection Commission" />
                         {errors.conducting_body && <p className="text-red-500 text-xs mt-1">{errors.conducting_body.message}</p>}
                       </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                       <div className="col-span-2">
                         <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail URL</label>
                         <input {...register('thumbnail_url')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="https://cdn.agnishiksha.com/..." />
                         {errors.thumbnail_url && <p className="text-red-500 text-xs mt-1">{errors.thumbnail_url.message}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
                         <input type="number" {...register('display_order', { valueAsNumber: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
                         {errors.display_order && <p className="text-red-500 text-xs mt-1">{errors.display_order.message}</p>}
                       </div>
                     </div>

                     <div className="flex items-center mt-4 bg-white p-3 rounded-lg border border-gray-200">
                       <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                       <label htmlFor="is_active" className="ml-2 text-sm font-semibold text-gray-700 cursor-pointer">Exam is Active (Visible to students)</label>
                     </div>
                   </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description <span className="text-red-500">*</span></label>
                        <textarea {...register('description')} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="Provide a detailed description of the exam..." />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Subjects <span className="text-red-500">*</span></label>
                        <div className="space-y-2">
                          {subjectFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <input {...register(`subjects.${index}.value`)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder={`Subject ${index + 1}`} />
                              <button type="button" onClick={() => removeSubject(index)} disabled={subjectFields.length === 1} className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent disabled:opacity-50">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects.message}</p>}
                        <button type="button" onClick={() => appendSubject({ value: '' })} className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover flex items-center bg-primary-light px-3 py-1.5 rounded-md">
                          <Plus className="w-4 h-4 mr-1" /> Add Subject
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-8">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Mode <span className="text-red-500">*</span></label>
                       <input {...register('exam_pattern.exam_mode')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g., Computer Based Test (CBT)" />
                       {errors.exam_pattern?.exam_mode && <p className="text-red-500 text-xs mt-1">{errors.exam_pattern.exam_mode.message}</p>}
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Selection Stages (Timeline)</label>
                       <div className="space-y-2">
                         {stagesFields.map((field, index) => (
                           <div key={field.id} className="flex gap-2 items-center">
                             <span className="text-xs font-bold text-gray-400 w-4">{index + 1}.</span>
                             <input {...register(`exam_pattern.selection_stages.${index}.value`)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="e.g., Tier-I (Prelims)" />
                             <button type="button" onClick={() => removeStage(index)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         ))}
                       </div>
                       <button type="button" onClick={() => appendStage({ value: '' })} className="mt-3 text-xs font-semibold text-primary flex items-center">
                         <Plus className="w-3 h-3 mr-1" /> Add Selection Stage
                       </button>
                     </div>

                     <div>
                       <div className="flex items-center justify-between mb-3">
                         <label className="block text-sm font-semibold text-gray-700">Detailed Tier Definitions</label>
                         <button type="button" onClick={() => appendTier({ tier_name: '', duration_minutes: 60, total_questions: 100, total_marks: 200, negative_marking: '-0.50', sections: [] })} className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded flex items-center shadow-sm hover:bg-primary-hover transition-colors">
                           <Plus className="w-3 h-3 mr-1" /> New Tier
                         </button>
                       </div>
                       
                       <div className="space-y-4">
                         {tierFields.length === 0 && <p className="text-sm text-gray-500 italic">No detailed tiers added yet.</p>}
                         {tierFields.map((field, index) => {
                           const tierErrors = errors.exam_pattern?.tier_details?.[index];
                           return (
                             <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                               <button type="button" onClick={() => removeTier(index)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                               <h4 className="text-sm font-bold text-gray-900 flex items-center mb-3">
                                 <LayoutList className="w-4 h-4 mr-2 text-primary" /> Tier Configuration #{index + 1}
                               </h4>
                               <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                 <div className="md:col-span-2">
                                   <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Tier Name</label>
                                   <input {...register(`exam_pattern.tier_details.${index}.tier_name`)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary outline-none" placeholder="e.g., Tier-I" />
                                   {tierErrors?.tier_name && <p className="text-red-500 text-[10px] mt-0.5">{tierErrors.tier_name.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Minutes</label>
                                   <input type="number" {...register(`exam_pattern.tier_details.${index}.duration_minutes`, { valueAsNumber: true })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary outline-none" />
                                   {tierErrors?.duration_minutes && <p className="text-red-500 text-[10px] mt-0.5">{tierErrors.duration_minutes.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Questions</label>
                                   <input type="number" {...register(`exam_pattern.tier_details.${index}.total_questions`, { valueAsNumber: true })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary outline-none" />
                                   {tierErrors?.total_questions && <p className="text-red-500 text-[10px] mt-0.5">{tierErrors.total_questions.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Marks</label>
                                   <input type="number" {...register(`exam_pattern.tier_details.${index}.total_marks`, { valueAsNumber: true })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary outline-none" />
                                   {tierErrors?.total_marks && <p className="text-red-500 text-[10px] mt-0.5">{tierErrors.total_marks.message}</p>}
                                 </div>
                               </div>
                               <div className="mt-3">
                                   <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Negative Marking Info</label>
                                   <input {...register(`exam_pattern.tier_details.${index}.negative_marking`)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-primary outline-none" placeholder="e.g., -0.50 marks per wrong answer" />
                               </div>
                               <TierSectionsFieldArray nestIndex={index} control={control} register={register} errors={errors} />
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   </motion.div>
                  )}

                  {/* STEP 4: PREVIEW MODE */}
                  {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-200 flex items-start">
                        <Eye className="w-5 h-5 mr-3 mt-0.5 shrink-0 text-orange-500" />
                        <div>
                          <h4 className="font-bold text-sm">Review Exam Configuration</h4>
                          <p className="text-xs mt-1">Please double-check the schema before publishing. The nested tier logic is correctly validated.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                        <div className="space-y-4">
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Exam Overview</span>
                            <div className="mt-1 font-medium text-gray-900 text-lg flex items-center">
                              {formData.name} 
                              {formData.is_active && <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">{formData.category} • {formData.conducting_body}</div>
                          </div>
                          
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">URL Slug</span>
                            <div className="text-sm text-primary font-mono bg-primary-light/30 inline-block px-2 py-0.5 rounded mt-1">/{formData.slug}</div>
                          </div>

                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Subjects</span>
                            <div className="flex flex-wrap gap-2">
                              {formData.subjects?.map((s: any, i: number) => (
                                <span key={i} className="bg-gray-100 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md">{s.value}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 border-l border-gray-100 pl-6">
                           <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Exam Pattern Schema</span>
                            <div className="bg-slate-900 rounded-lg p-3 overflow-auto max-h-48 text-[10px] font-mono text-emerald-400">
                                <pre>{JSON.stringify({
                                  mode: formData.exam_pattern?.exam_mode,
                                  stages: formData.exam_pattern?.selection_stages?.map((s: any) => s.value),
                                  tiers: formData.exam_pattern?.tier_details?.length
                                }, null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Navigation Footer */}
              <div className="p-4 border-t border-gray-100 bg-white flex justify-between gap-3 shrink-0 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                  Cancel
                </button>
                
                <div className="flex gap-2">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </button>
                  )}
                  
                  {step < TOTAL_STEPS ? (
                    <button type="button" onClick={handleNext} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors flex items-center shadow-md">
                      Next Step <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    // FIX: Final submit button completely detached from form HTML submission.
                    <button type="button" onClick={onFinalSubmit} disabled={isLoading} className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-md disabled:opacity-70">
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                      {initialData ? 'Save Changes' : 'Publish Exam'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};