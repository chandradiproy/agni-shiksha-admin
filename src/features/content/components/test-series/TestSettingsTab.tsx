// src/features/content/components/test-series/TestSettingsTab.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Settings, Layers, Play, Save, Loader2 } from 'lucide-react';
import type { TestSeries, CreateTestSeriesPayload } from '../../types';

const MySwal = withReactContent(Swal);

const tsSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['MOCK', 'PREVIOUS_YEAR', 'SECTIONAL', 'CHAPTER_WISE']),
  test_type: z.enum(['OBJECTIVE', 'SUBJECTIVE']),
  subject: z.string().optional(),
  total_questions: z.number().min(1, 'Required'),
  duration_minutes: z.number().min(1, 'Required'),
  total_marks: z.number().min(1, 'Required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  negative_marking: z.boolean(),
  negative_marks_per_wrong: z.number().optional(),
  is_published: z.boolean(),
  is_active: z.boolean()
});

type TsFormInputs = z.infer<typeof tsSchema>;

interface TestSettingsTabProps {
  selectedTs: TestSeries | undefined;
  isCreating: boolean;
  onSubmit: (data: CreateTestSeriesPayload) => void;
  isPending: boolean;
  examId: string;
}

export const TestSettingsTab: React.FC<TestSettingsTabProps> = ({ selectedTs, isCreating, onSubmit, isPending, examId }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TsFormInputs>({
    resolver: zodResolver(tsSchema),
    defaultValues: { type: 'MOCK', test_type: 'OBJECTIVE', difficulty: 'MEDIUM', negative_marking: false, is_published: false, is_active: true, total_questions: 100, duration_minutes: 60, total_marks: 200 }
  });

  const watchNegativeMarking = watch('negative_marking');

  useEffect(() => {
    if (selectedTs && !isCreating) {
      reset({ ...selectedTs } as any);
    } else if (isCreating) {
      reset({ type: 'MOCK', test_type: 'OBJECTIVE', difficulty: 'MEDIUM', negative_marking: false, is_published: false, is_active: true, total_questions: 100, duration_minutes: 60, total_marks: 200, title: '', description: '', subject: '', negative_marks_per_wrong: 0 });
    }
  }, [selectedTs, isCreating, reset]);

  const handleFormSubmit = (data: TsFormInputs) => {
    // If the user is trying to publish it for the first time
    const isNewlyPublishing = !selectedTs?.is_published && data.is_published;

    if (isNewlyPublishing) {
      MySwal.fire({
        title: 'Publish Test Series?',
        text: 'Once published, you will NOT be able to modify or delete questions to protect student records. Are you sure you want to go live?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Publish It!'
      }).then((result) => {
        if (result.isConfirmed) {
          onSubmit({ ...data, exam_id: examId });
        }
      });
    } else {
      onSubmit({ ...data, exam_id: examId });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* Basic Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center"><Settings className="w-4 h-4 mr-2 text-primary" /> Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Test Title <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} {...register('title')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <textarea disabled={selectedTs?.is_published} {...register('description')} rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none text-sm disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Series Type <span className="text-red-500">*</span></label>
            <select disabled={selectedTs?.is_published} {...register('type')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm disabled:bg-gray-50">
              <option value="MOCK">Mock Test</option><option value="PREVIOUS_YEAR">Previous Year Paper</option><option value="SECTIONAL">Sectional Test</option><option value="CHAPTER_WISE">Chapter Wise</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Difficulty <span className="text-red-500">*</span></label>
            <select disabled={selectedTs?.is_published} {...register('difficulty')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm disabled:bg-gray-50">
              <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center"><Layers className="w-4 h-4 mr-2 text-primary" /> Test Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Qs <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('total_questions', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
            {errors.total_questions && <p className="text-red-500 text-xs mt-1">{errors.total_questions.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Duration (Mins) <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('duration_minutes', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Marks <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('total_marks', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Publishing Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div><label className="text-sm font-bold text-gray-900">Enable Negative Marking</label><p className="text-xs text-gray-500">Deduct marks for incorrect answers.</p></div>
          <input disabled={selectedTs?.is_published} type="checkbox" {...register('negative_marking')} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
        </div>
        {watchNegativeMarking && (
          <div className="flex items-center justify-between animate-in fade-in bg-white p-3 rounded-lg border border-gray-200">
            <label className="text-sm font-semibold text-gray-700">Penalty per wrong answer</label>
            <input disabled={selectedTs?.is_published} type="number" step="0.01" {...register('negative_marks_per_wrong', { valueAsNumber: true })} className="w-24 px-3 py-1.5 border border-gray-300 rounded text-right focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
        )}
        <hr className="border-gray-200" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-sm font-bold text-gray-900 flex items-center">Publish Test Series <Play className="w-3.5 h-3.5 ml-1.5 text-green-600" /></label>
            <p className="text-xs text-gray-500">Make test live for students. Locks all questions.</p>
          </div>
          <input type="checkbox" {...register('is_published')} className="w-5 h-5 text-green-600 rounded focus:ring-green-600 border-gray-300" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending} className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center justify-center shadow-md disabled:opacity-70 transition-colors">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2" />}
          {isCreating ? 'Create Test Series' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};