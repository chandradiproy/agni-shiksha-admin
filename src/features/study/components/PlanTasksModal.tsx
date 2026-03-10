// src/features/study/components/PlanTasksModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, FileText, Video, Layers, Plus } from 'lucide-react';
import type { StudyPlan, StudyPlanTask } from '../types';

interface PlanTasksModalProps {
  plan: StudyPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onEditTask: (task: StudyPlanTask) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTask: () => void;
}

export const PlanTasksModal: React.FC<PlanTasksModalProps> = ({ plan, isOpen, onClose, onEditTask, onDeleteTask, onAddNewTask }) => {
  if (!plan) return null;

  const sortedTasks = [...(plan.tasks || [])].sort((a, b) => a.day_number - b.day_number);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden pointer-events-auto flex flex-col h-[85vh]">
              
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-surface shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{plan.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center"><Layers className="w-4 h-4 mr-1.5" /> Manage Tasks ({sortedTasks.length})</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={onAddNewTask} className="bg-primary-light text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center transition-colors">
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </button>
                  <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                {sortedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Layers className="w-16 h-16 mb-4 text-gray-200" />
                    <p className="text-lg font-medium text-gray-500">No tasks added yet.</p>
                    <button onClick={onAddNewTask} className="mt-3 text-primary font-semibold hover:underline">Create the first task</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedTasks.map(task => (
                      <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm hover:border-primary-light transition-colors group">
                        
                        <div className="bg-orange-50 text-orange-700 font-bold px-3 py-2 rounded-lg text-center min-w-[70px] shrink-0 border border-orange-100">
                          <span className="block text-[10px] uppercase tracking-wider opacity-80">DAY</span>
                          <span className="text-xl leading-none">{task.day_number}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base">{task.task_title}</h3>
                          {task.task_description && <p className="text-sm text-gray-600 mt-1">{task.task_description}</p>}
                          
                          {task.material && (
                            <div className="mt-3 inline-flex items-center bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 max-w-full">
                              {task.material.material_type === 'PDF' ? <FileText className="w-3.5 h-3.5 mr-1.5 text-red-500 shrink-0" /> : <Video className="w-3.5 h-3.5 mr-1.5 text-blue-500 shrink-0" />}
                              <span className="truncate">{task.material.title}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => onEditTask(task)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Task">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteTask(task.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Task">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};