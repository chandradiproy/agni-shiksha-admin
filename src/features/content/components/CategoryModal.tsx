import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { ExamCategory, CreateCategoryPayload } from '../types';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Lower-case letters, numbers, and hyphens only'),
  icon_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean(),
});

type CategoryFormInputs = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryPayload) => void;
  initialData?: ExamCategory | null;
  isLoading: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormInputs>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      icon_url: '',
      is_active: true,
    },
  });

  const nameVal = watch('name');

  // Auto-generate slug from name if creating
  useEffect(() => {
    if (!initialData && nameVal && !watch('slug')) {
      setValue('slug', nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [nameVal, initialData, setValue, watch]);

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          slug: initialData.slug,
          icon_url: initialData.icon_url || '',
          is_active: initialData.is_active,
        });
      } else {
        reset({
          name: '',
          slug: '',
          icon_url: '',
          is_active: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Master Category' : 'Create Master Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. UPSC, SSC"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Slug (URL friendly) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('slug')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                placeholder="e.g. upsc"
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
              <p className="text-[10px] text-gray-500 mt-1">Used to identify this category internally.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icon URL</label>
              <input
                {...register('icon_url')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="https://example.com/icon.svg"
              />
              {errors.icon_url && <p className="text-red-500 text-xs mt-1">{errors.icon_url.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="font-semibold text-gray-900 text-sm">Active Status</label>
                <p className="text-xs text-gray-500">Visible to students in the app.</p>
              </div>
              <input
                type="checkbox"
                {...register('is_active')}
                className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-70 transition-colors flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {initialData ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
