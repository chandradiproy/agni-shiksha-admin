// src/features/news/components/CreateArticleModal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Newspaper, Save } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Updated CSS import path
import type { CreateCustomArticlePayload } from '../types';

// Zod Schema with custom HTML tag stripping for the content length validation
const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  summary: z.string().optional(),
  content: z.string().refine((val) => {
    // Strip HTML tags to check actual text length
    const strippedText = val.replace(/<[^>]*>?/gm, '').trim();
    return strippedText.length >= 20;
  }, {
    message: 'Content must be at least 20 characters long'
  }),
  source_name: z.string().default('Agni Shiksha Official'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_pinned: z.boolean().default(false),
});

type FormInputs = z.infer<typeof articleSchema>;

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomArticlePayload) => void;
  isPending: boolean;
}

// Configuration for the Rich Text Editor Toolbar
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }], // Font Sizes
    ['bold', 'italic', 'underline', 'strike'],       // Font Styles
    [{ 'color': [] }, { 'background': [] }],         // Colors & Highlighting
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],    // Lists
    [{ 'align': [] }],                               // Text Alignment
    ['blockquote', 'code-block'],
    ['link', 'image'],                               // Media & Links
    ['clean']                                        // Remove Formatting
  ],
};

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({ isOpen, onClose, onSubmit, isPending }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(articleSchema),
    defaultValues: { source_name: 'Agni Shiksha Official', is_pinned: false, content: '' }
  });

  useEffect(() => {
    if (isOpen) reset({ source_name: 'Agni Shiksha Official', is_pinned: false, title: '', summary: '', content: '', image_url: '' });
  }, [isOpen, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden pointer-events-auto flex flex-col max-h-[95vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3">
                    <Newspaper className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Create Custom Article</h2>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="create-article-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Headline / Title <span className="text-red-500">*</span></label>
                    <input {...register('title')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Article Title" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Short Summary (Optional)</label>
                    <textarea {...register('summary')} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="A brief 1-2 sentence overview shown in the news feed..." />
                  </div>

                  {/* Rich Text Editor Section */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Content <span className="text-red-500">*</span></label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-shadow">
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                          <ReactQuill
                            theme="snow"
                            modules={quillModules}
                            value={field.value}
                            onChange={field.onChange}
                            className="bg-white min-h-[300px] flex flex-col"
                          />
                        )}
                      />
                    </div>
                    {/* Add a tiny bit of global CSS inline to fix Quill height behaviors inside flexboxes */}
                    <style>{`
                      .ql-container { font-size: 15px; flex: 1; display: flex; flex-direction: column; }
                      .ql-editor { min-height: 250px; flex: 1; }
                      .ql-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; background-color: #fafaf9; }
                      .ql-container.ql-snow { border: none !important; }
                    `}</style>
                    {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Image URL</label>
                      <input {...register('image_url')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="https://cdn.agnishiksha.com/..." />
                      {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Source Name</label>
                      <input {...register('source_name')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-gray-50" />
                    </div>
                  </div>

                  <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <input type="checkbox" id="is_pinned" {...register('is_pinned')} className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300" />
                    <label htmlFor="is_pinned" className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer flex-1">Pin this article to the top of student feeds</label>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" form="create-article-form" disabled={isPending} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center shadow-sm disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Publish Article
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};