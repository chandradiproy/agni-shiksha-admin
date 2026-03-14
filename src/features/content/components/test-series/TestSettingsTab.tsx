// src/features/content/components/test-series/TestSettingsTab.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Settings, Layers, Play, Save, Loader2, CalendarClock, BookOpen, IndianRupee } from 'lucide-react';
import type { TestSeries, CreateTestSeriesPayload } from '../../types';

const MySwal = withReactContent(Swal);

// Helper to convert UTC ISO string to local datetime-local format
const formatLocal = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// Helper to convert local datetime-local string to UTC ISO string
const toUTC = (local?: string | null) => {
  if (!local) return null;
  return new Date(local).toISOString();
};

const tsSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  type: z.string(),
  test_type: z.string(),
  subject: z.string().optional().nullable(),
  total_questions: z.number().min(1, 'Required'),
  duration_minutes: z.number().min(1, 'Required'),
  total_marks: z.number().min(1, 'Required'),
  difficulty: z.string(),
  negative_marking: z.boolean(),
  negative_marks_per_wrong: z.number().optional().nullable(),
  is_all_india: z.boolean(),
  is_scheduled: z.boolean(),
  scheduled_at: z.string().optional().nullable(),
  available_from: z.string().optional().nullable(),
  available_until: z.string().optional().nullable(),
  max_attempts: z.number().min(1, 'Required'),
  show_solutions: z.boolean(),
  show_solutions_after: z.string(),
  price_if_standalone: z.number().optional().nullable(),
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
    defaultValues: { 
      type: 'free', test_type: 'full_mock', difficulty: 'medium', negative_marking: false, 
      is_published: false, is_active: true, is_all_india: false, is_scheduled: false,
      total_questions: 100, duration_minutes: 60, total_marks: 200, max_attempts: 3, 
      show_solutions: true, show_solutions_after: 'immediate'
    }
  });

  const watchNegativeMarking = watch('negative_marking');
  const watchIsScheduled = watch('is_scheduled');
  const watchShowSolutions = watch('show_solutions');

  useEffect(() => {
    if (selectedTs && !isCreating) {
      reset({
        title: selectedTs.title,
        description: selectedTs.description,
        instructions: selectedTs.instructions,
        type: selectedTs.type || 'free',
        test_type: selectedTs.test_type || 'full_mock',
        subject: selectedTs.subject || '',
        difficulty: selectedTs.difficulty || 'medium',
        total_questions: selectedTs.total_questions,
        duration_minutes: selectedTs.duration_minutes,
        total_marks: selectedTs.total_marks,
        negative_marking: selectedTs.negative_marking,
        negative_marks_per_wrong: selectedTs.negative_marks_per_wrong,
        is_all_india: selectedTs.is_all_india,
        is_scheduled: selectedTs.is_scheduled,
        scheduled_at: formatLocal(selectedTs.scheduled_at),
        available_from: formatLocal(selectedTs.available_from),
        available_until: formatLocal(selectedTs.available_until),
        max_attempts: selectedTs.max_attempts || 3,
        show_solutions: selectedTs.show_solutions,
        show_solutions_after: selectedTs.show_solutions_after || 'immediate',
        price_if_standalone: selectedTs.price_if_standalone,
        is_published: selectedTs.is_published,
        is_active: selectedTs.is_active
      });
    } else if (isCreating) {
      reset({ 
        type: 'free', test_type: 'full_mock', difficulty: 'medium', negative_marking: false, 
        is_published: false, is_active: true, is_all_india: false, is_scheduled: false,
        total_questions: 100, duration_minutes: 60, total_marks: 200, max_attempts: 3, 
        show_solutions: true, show_solutions_after: 'immediate', title: '', description: '', 
        instructions: '', subject: '', negative_marks_per_wrong: null, price_if_standalone: null,
        scheduled_at: '', available_from: formatLocal(new Date().toISOString()), available_until: ''
      });
    }
  }, [selectedTs, isCreating, reset]);

  const handleFormSubmit = (data: TsFormInputs) => {
    const payload: CreateTestSeriesPayload = {
      ...data,
      exam_id: examId,
      scheduled_at: toUTC(data.scheduled_at),
      available_from: toUTC(data.available_from),
      available_until: toUTC(data.available_until),
    };

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
          onSubmit(payload);
        }
      });
    } else {
      onSubmit(payload);
    }
  };

  // Safe number parser for empty strings
  const numberParser = { valueAsNumber: true, setValueAs: (v: any) => v === "" || isNaN(Number(v)) ? null : Number(v) };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 animate-in fade-in">
      
      {/* --- Basic Information --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
          <Settings className="w-4 h-4 mr-2 text-primary" /> Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Test Title <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} {...register('title')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-5 md:col-span-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Access Tier <span className="text-red-500">*</span></label>
              <select disabled={selectedTs?.is_published} {...register('type')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm disabled:bg-gray-50">
                <option value="free">Free</option><option value="premium">Premium</option><option value="premium_plus">Premium Plus</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Test Type <span className="text-red-500">*</span></label>
              <select disabled={selectedTs?.is_published} {...register('test_type')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm disabled:bg-gray-50">
                <option value="full_mock">Full Mock</option><option value="sectional">Sectional</option><option value="mini">Mini Mock</option><option value="pyq">PYQ</option><option value="ca">Current Affairs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Specific Subject (Optional)</label>
            <input disabled={selectedTs?.is_published} {...register('subject')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" placeholder="e.g., General Intelligence" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Difficulty <span className="text-red-500">*</span></label>
            <select disabled={selectedTs?.is_published} {...register('difficulty')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm disabled:bg-gray-50">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Short Description</label>
            <textarea disabled={selectedTs?.is_published} {...register('description')} rows={2} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none text-sm disabled:bg-gray-50" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Test Instructions (Shown before start)</label>
            <textarea disabled={selectedTs?.is_published} {...register('instructions')} rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none text-sm disabled:bg-gray-50" placeholder="Custom instructions specific to this test..." />
          </div>
        </div>
      </div>

      {/* --- Test Configuration --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
          <Layers className="w-4 h-4 mr-2 text-primary" /> Test Configuration
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Qs <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('total_questions', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
            {errors.total_questions && <p className="text-red-500 text-xs mt-1">{errors.total_questions.message}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Duration (Mins) <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('duration_minutes', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Marks <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('total_marks', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Max Attempts <span className="text-red-500">*</span></label>
            <input disabled={selectedTs?.is_published} type="number" {...register('max_attempts', { valueAsNumber: true })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-900">Negative Marking</label>
              <input disabled={selectedTs?.is_published} type="checkbox" {...register('negative_marking')} className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300" />
            </div>
            {watchNegativeMarking && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Marks deducted per wrong answer:</span>
                <input disabled={selectedTs?.is_published} type="number" step="0.01" {...register('negative_marks_per_wrong', numberParser)} className="w-20 px-2 py-1.5 border border-gray-300 rounded text-right focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-100" placeholder="0.50" />
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-gray-900">All India Mock Test</label>
                <p className="text-[10px] text-gray-500 mt-0.5">Feature test prominently on the global leaderboard.</p>
              </div>
              <input disabled={selectedTs?.is_published} type="checkbox" {...register('is_all_india')} className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Availability & Scheduling --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
          <CalendarClock className="w-4 h-4 mr-2 text-primary" /> Availability & Scheduling
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Available From <span className="text-red-500">*</span></label>
            <input type="datetime-local" disabled={selectedTs?.is_published} {...register('available_from')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Available Until (Optional)</label>
            <input type="datetime-local" disabled={selectedTs?.is_published} {...register('available_until')} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-50" />
          </div>
        </div>

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-gray-900">Strict Scheduling (Live Test)</label>
              <p className="text-[10px] text-gray-500 mt-0.5">Force all students to start the test exactly at a scheduled time.</p>
            </div>
            <input disabled={selectedTs?.is_published} type="checkbox" {...register('is_scheduled')} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 border-gray-300" />
          </div>
          {watchIsScheduled && (
            <div className="mt-4 pt-4 border-t border-blue-100">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Scheduled Start Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" disabled={selectedTs?.is_published} {...register('scheduled_at')} className="w-full md:w-1/2 px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-gray-50" />
            </div>
          )}
        </div>
      </div>

      {/* --- Post-Test Experience --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-primary" /> Post-Test Experience & Monetization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-900">Show Solutions to Student</label>
              <input disabled={selectedTs?.is_published} type="checkbox" {...register('show_solutions')} className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300" />
            </div>
            {watchShowSolutions && (
              <select disabled={selectedTs?.is_published} {...register('show_solutions_after')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm disabled:bg-gray-100">
                <option value="immediate">Immediately after submission</option>
                <option value="after_end_time">After the test's Availability End Time</option>
                <option value="manual">Manual Release (Hidden for now)</option>
              </select>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <label className="text-sm font-bold text-gray-900 flex items-center mb-1">
               <IndianRupee className="w-3.5 h-3.5 mr-1" /> Standalone Price (Optional)
             </label>
             <p className="text-[10px] text-gray-500 mb-3">Allow users to buy just this test (Value in INR). Leave blank for plan-only access.</p>
             <input disabled={selectedTs?.is_published} type="number" {...register('price_if_standalone', numberParser)} className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm disabled:bg-gray-100" placeholder="e.g., 99" />
          </div>
        </div>
      </div>

      {/* --- Publishing Card --- */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-sm font-bold text-gray-900 flex items-center">Active Status</label>
            <p className="text-xs text-gray-500">Visible to students in the app.</p>
          </div>
          <input type="checkbox" {...register('is_active')} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
        </div>
        <hr className="border-gray-200" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-sm font-bold text-gray-900 flex items-center">Publish Test Series <Play className="w-3.5 h-3.5 ml-1.5 text-green-600" /></label>
            <p className="text-xs text-gray-500">Lock all questions and schemas to go live.</p>
          </div>
          <input type="checkbox" {...register('is_published')} className="w-5 h-5 text-green-600 rounded focus:ring-green-600 border-gray-300" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending} className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center justify-center shadow-md disabled:opacity-70 transition-colors">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2" />}
          {isCreating ? 'Create Test Series' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
};