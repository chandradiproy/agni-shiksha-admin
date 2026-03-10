// src/features/study/components/StudyPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader2, Plus, BookOpen, Video, FileText, CalendarDays, Crown, ChevronRight, Layers, Edit2, Trash2 } from 'lucide-react';
import { studyService } from '../services/study.service';
import { examService } from '../../content/services/exam.service';
import { useUIStore } from '../../../store/uiStore';
import { CreateMaterialModal } from './CreateMaterialModal';
import { CreatePlanModal } from './CreatePlanModal';
import { AddTaskModal } from './AddTaskModal';
import { PlanTasksModal } from './PlanTasksModal';
import { Authorize } from '../../../components/guard/Authorize';
import type { StudyPlan, StudyMaterial, StudyPlanTask } from '../types';

const MySwal = withReactContent(Swal);

export const StudyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);
  
  const [activeTab, setActiveTab] = useState<'materials' | 'plans'>('materials');

  // --- Modal States ---
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyPlanTask | null>(null);
  const [targetPlanForTask, setTargetPlanForTask] = useState<{ id: string, title: string, duration_days: number, exam_id: string } | null>(null);

  const [viewingPlanTasks, setViewingPlanTasks] = useState<StudyPlan | null>(null);

  // --- Queries ---
  const { data: examsData } = useQuery({ queryKey: ['exams'], queryFn: () => examService.getExams(1, 100, '') });
  const { data: materialsData, isLoading: loadingMaterials } = useQuery({ queryKey: ['materials'], queryFn: studyService.getMaterials });
  const { data: plansData, isLoading: loadingPlans } = useQuery({ queryKey: ['plans'], queryFn: studyService.getPlans });

  const exams = examsData?.data || [];
  const materials = materialsData?.data || [];
  const plans = plansData?.data || [];

  // Automatically keep the `viewingPlanTasks` updated if data refreshes in background
  const activePlanTasks = plans.find(p => p.id === viewingPlanTasks?.id) || viewingPlanTasks;

  // --- Material Mutations ---
  const saveMaterial = useMutation({
    mutationFn: (data: any) => editingMaterial ? studyService.updateMaterial(editingMaterial.id, data) : studyService.createMaterial(data),
    onSuccess: () => { 
      addToast(`Material ${editingMaterial ? 'updated' : 'uploaded'} successfully`, 'success'); 
      setMaterialModalOpen(false); 
      queryClient.invalidateQueries({ queryKey: ['materials'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to save material', 'error')
  });

  const deleteMaterial = useMutation({
    mutationFn: studyService.deleteMaterial,
    onSuccess: () => { MySwal.fire('Deleted!', 'Material removed.', 'success'); queryClient.invalidateQueries({ queryKey: ['materials'] }); },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete material', 'error')
  });

  // --- Plan Mutations ---
  const savePlan = useMutation({
    mutationFn: (data: any) => editingPlan ? studyService.updatePlan(editingPlan.id, data) : studyService.createPlan(data),
    onSuccess: () => { 
      addToast(`Study plan ${editingPlan ? 'updated' : 'created'} successfully`, 'success'); 
      setPlanModalOpen(false); 
      queryClient.invalidateQueries({ queryKey: ['plans'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to save plan', 'error')
  });

  const deletePlan = useMutation({
    mutationFn: studyService.deletePlan,
    onSuccess: () => { 
      MySwal.fire('Deleted!', 'Study plan and all tasks removed.', 'success'); 
      if (viewingPlanTasks) setViewingPlanTasks(null);
      queryClient.invalidateQueries({ queryKey: ['plans'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete plan', 'error')
  });

  // --- Task Mutations ---
  const saveTask = useMutation({
    mutationFn: (data: any) => editingTask ? studyService.updateTask(editingTask.id, data) : studyService.addTask(targetPlanForTask!.id, data),
    onSuccess: () => { 
      addToast(`Task ${editingTask ? 'updated' : 'added'} successfully!`, 'success'); 
      setTaskModalOpen(false); 
      queryClient.invalidateQueries({ queryKey: ['plans'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to save task', 'error')
  });

  const deleteTask = useMutation({
    mutationFn: studyService.deleteTask,
    onSuccess: () => { MySwal.fire('Deleted!', 'Task removed from plan.', 'success'); queryClient.invalidateQueries({ queryKey: ['plans'] }); },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete task', 'error')
  });

  // --- Deletion Handlers ---
  const confirmDelete = (name: string, action: () => void) => {
    MySwal.fire({
      title: 'Are you sure?', text: `You are about to delete "${name}". This cannot be undone.`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ea580c', confirmButtonText: 'Yes, delete it!'
    }).then(result => { if (result.isConfirmed) action(); });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Material & Syllabus</h1>
            <p className="text-sm text-gray-500 mt-1">Manage PDFs, Videos, and day-wise Study Plans.</p>
          </div>
          <Authorize allowedRoles={['super_admin', 'content_manager']}>
            <div className="flex gap-3">
              {activeTab === 'materials' ? (
                <button onClick={() => { setEditingMaterial(null); setMaterialModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors">
                  <Plus className="w-4 h-4 mr-2" /> Upload Material
                </button>
              ) : (
                <button onClick={() => { setEditingPlan(null); setPlanModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors">
                  <Plus className="w-4 h-4 mr-2" /> Create Plan
                </button>
              )}
            </div>
          </Authorize>
        </div>

        <div className="flex gap-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('materials')} className={`text-sm font-semibold pb-3 border-b-2 transition-colors flex items-center ${activeTab === 'materials' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>
            <BookOpen className="w-4 h-4 mr-2" /> Study Materials
          </button>
          <button onClick={() => setActiveTab('plans')} className={`text-sm font-semibold pb-3 border-b-2 transition-colors flex items-center ${activeTab === 'plans' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>
            <CalendarDays className="w-4 h-4 mr-2" /> Study Plans (Syllabus)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'materials' && (
          loadingMaterials ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No materials uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {materials.map(mat => (
                <div key={mat.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary-light transition-all relative overflow-hidden group flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl ${mat.material_type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary'}`}>
                      {mat.material_type === 'PDF' ? <FileText className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {mat.is_premium ? <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center"><Crown className="w-3 h-3 mr-1" /> PRO</span> : <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">FREE</span>}
                      {!mat.is_active ? <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">INACTIVE</span> : <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">ACTIVE</span>}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-2 leading-tight" title={mat.title}>{mat.title}</h3>
                  <div className="text-xs text-gray-500 mb-4 flex flex-wrap items-center gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider font-bold text-gray-600">{mat.subject}</span>
                    <span className="truncate">{mat.exam?.name || 'General'}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-auto flex items-center justify-between">
                    <a href={mat.file_url} target="_blank" rel="noreferrer" className="text-sm text-primary font-semibold hover:text-primary-hover transition-colors flex items-center w-fit">
                      View {mat.material_type === 'PDF' ? 'Document' : 'Video'} <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                    <Authorize allowedRoles={['super_admin', 'content_manager']}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingMaterial(mat); setMaterialModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => confirmDelete(mat.title, () => deleteMaterial.mutate(mat.id))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </Authorize>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'plans' && (
          loadingPlans ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
              <CalendarDays className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No study plans created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-light transition-all flex flex-col group shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-primary-light text-primary-hover text-xs font-bold px-3 py-1.5 rounded-lg border border-primary-light/50">{plan.duration_days} Day Plan</span>
                    <Authorize allowedRoles={['super_admin', 'content_manager']}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-0.5">
                        <button onClick={() => { setEditingPlan(plan); setPlanModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => confirmDelete(plan.title, () => deletePlan.mutate(plan.id))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </Authorize>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-1.5">{plan.title}</h3>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{plan.exam?.name}</p>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <button onClick={() => setViewingPlanTasks(plan)} className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
                      <Layers className="w-4 h-4 mr-1.5 text-gray-400"/> {plan._count?.tasks || 0} Tasks
                    </button>
                    <Authorize allowedRoles={['super_admin', 'content_manager']}>
                      <button onClick={() => { setTargetPlanForTask({ id: plan.id, title: plan.title, duration_days: plan.duration_days, exam_id: plan.exam_id }); setEditingTask(null); setTaskModalOpen(true); }} className="text-sm font-bold text-primary hover:bg-primary-light/50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-light flex items-center">
                        <Plus className="w-4 h-4 mr-1"/> Add Task
                      </button>
                    </Authorize>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <CreateMaterialModal 
        isOpen={materialModalOpen} onClose={() => setMaterialModalOpen(false)} 
        onSubmit={(d) => saveMaterial.mutate(d)} isPending={saveMaterial.isPending} exams={exams} initialData={editingMaterial} 
      />
      
      <CreatePlanModal 
        isOpen={planModalOpen} onClose={() => setPlanModalOpen(false)} 
        onSubmit={(d) => savePlan.mutate(d)} isPending={savePlan.isPending} exams={exams} initialData={editingPlan} 
      />
      
      <AddTaskModal 
        isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} 
        onSubmit={(d) => saveTask.mutate(d)} isPending={saveTask.isPending} 
        planDuration={targetPlanForTask?.duration_days || 30} planTitle={targetPlanForTask?.title || ''} examId={targetPlanForTask?.exam_id || ''}
        materials={materials} initialData={editingTask} 
      />

      <PlanTasksModal 
        isOpen={!!viewingPlanTasks} onClose={() => setViewingPlanTasks(null)} plan={activePlanTasks as any}
        onAddNewTask={() => { setTargetPlanForTask({ id: activePlanTasks!.id, title: activePlanTasks!.title, duration_days: activePlanTasks!.duration_days, exam_id: activePlanTasks!.exam_id }); setEditingTask(null); setTaskModalOpen(true); }}
        onEditTask={(task) => { setTargetPlanForTask({ id: activePlanTasks!.id, title: activePlanTasks!.title, duration_days: activePlanTasks!.duration_days, exam_id: activePlanTasks!.exam_id }); setEditingTask(task); setTaskModalOpen(true); }}
        onDeleteTask={(taskId) => confirmDelete('this task', () => deleteTask.mutate(taskId))}
      />
    </div>
  );
};