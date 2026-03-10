// src/features/gamification/components/GamificationPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Loader2, Plus, Target, Award, Zap, Shield, Edit2, Trash2 } from 'lucide-react';
import { gamificationService } from '../services/gamification.service';
import { useUIStore } from '../../../store/uiStore';
import { QuestModal } from './QuestModal';
import { BadgeModal } from './BadgeModal';
import { Authorize } from '../../../components/guard/Authorize';
import type { Quest, Badge } from '../types';

const MySwal = withReactContent(Swal);

export const GamificationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);
  
  const [activeTab, setActiveTab] = useState<'quests' | 'badges'>('quests');
  const [isQuestModalOpen, setQuestModalOpen] = useState(false);
  const [isBadgeModalOpen, setBadgeModalOpen] = useState(false);
  
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  // --- Queries ---
  const { data: questsData, isLoading: loadingQuests } = useQuery({ 
    queryKey: ['quests'], queryFn: gamificationService.getQuests 
  });
  const { data: badgesData, isLoading: loadingBadges } = useQuery({ 
    queryKey: ['badges'], queryFn: gamificationService.getBadges 
  });

  const quests = questsData?.data || [];
  const badges = badgesData?.data || [];

  // --- Mutations ---
  const saveQuest = useMutation({
    mutationFn: (data: any) => editingQuest ? gamificationService.updateQuest(editingQuest.id, data) : gamificationService.createQuest(data),
    onSuccess: () => { 
      addToast(`Quest ${editingQuest ? 'updated' : 'created'} successfully`, 'success'); 
      setQuestModalOpen(false); 
      setEditingQuest(null);
      queryClient.invalidateQueries({ queryKey: ['quests'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to save quest', 'error')
  });

  const deleteQuest = useMutation({
    mutationFn: gamificationService.deleteQuest,
    onSuccess: () => { 
      MySwal.fire('Deleted!', 'The quest has been removed.', 'success'); 
      queryClient.invalidateQueries({ queryKey: ['quests'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete quest', 'error')
  });

  const saveBadge = useMutation({
    mutationFn: (data: any) => editingBadge ? gamificationService.updateBadge(editingBadge.id, data) : gamificationService.createBadge(data),
    onSuccess: () => { 
      addToast(`Badge ${editingBadge ? 'updated' : 'created'} successfully`, 'success'); 
      setBadgeModalOpen(false); 
      setEditingBadge(null);
      queryClient.invalidateQueries({ queryKey: ['badges'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to save badge', 'error')
  });

  const deleteBadge = useMutation({
    mutationFn: gamificationService.deleteBadge,
    onSuccess: () => { 
      MySwal.fire('Deleted!', 'The badge has been removed.', 'success'); 
      queryClient.invalidateQueries({ queryKey: ['badges'] }); 
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to delete badge', 'error')
  });

  const confirmDelete = (type: 'quest' | 'badge', name: string, action: () => void) => {
    MySwal.fire({
      title: `Delete ${type}?`,
      text: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => { if (result.isConfirmed) action(); });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gamification Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Configure student quests, XP rewards, and achievement badges.</p>
          </div>
          <Authorize allowedRoles={['super_admin', 'content_manager']}>
            <div className="flex gap-3">
              {activeTab === 'quests' ? (
                <button onClick={() => { setEditingQuest(null); setQuestModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors">
                  <Plus className="w-4 h-4 mr-2" /> New Quest
                </button>
              ) : (
                <button onClick={() => { setEditingBadge(null); setBadgeModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors">
                  <Plus className="w-4 h-4 mr-2" /> New Badge
                </button>
              )}
            </div>
          </Authorize>
        </div>

        <div className="flex gap-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('quests')} className={`text-sm font-semibold pb-3 border-b-2 transition-colors flex items-center ${activeTab === 'quests' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>
            <Target className="w-4 h-4 mr-2" /> Daily/Weekly Quests
          </button>
          <button onClick={() => setActiveTab('badges')} className={`text-sm font-semibold pb-3 border-b-2 transition-colors flex items-center ${activeTab === 'badges' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}>
            <Award className="w-4 h-4 mr-2" /> Achievement Badges
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'quests' && (
          loadingQuests ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : quests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
              <Target className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No quests configured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map(quest => (
                <div key={quest.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all group ${quest.is_active ? 'border-gray-200 hover:border-primary-light' : 'border-gray-200 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-100">
                      {quest.target_action.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2 relative">
                      <span className="flex items-center text-primary font-bold text-sm bg-primary-light px-2 py-0.5 rounded-md">
                        <Zap className="w-3.5 h-3.5 mr-1" /> +{quest.xp_reward} XP
                      </span>
                      <Authorize allowedRoles={['super_admin', 'content_manager']}>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm border border-gray-100 rounded-md p-0.5 absolute top-8 right-0 sm:-top-1 sm:-right-10 z-10">
                          <button onClick={() => { setEditingQuest(quest); setQuestModalOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => confirmDelete('quest', quest.title, () => deleteQuest.mutate(quest.id))} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Authorize>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{quest.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quest.description}</p>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Target: <strong className="text-gray-900">{quest.target_count}</strong></span>
                    <span className={`font-semibold ${quest.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {quest.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'badges' && (
          loadingBadges ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : badges.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-xl border-dashed">
              <Award className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No badges created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {badges.map(badge => (
                <div key={badge.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center flex flex-col items-center hover:border-primary-light hover:shadow-md transition-all relative group">
                  <Authorize allowedRoles={['super_admin', 'content_manager']}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm border border-gray-100 rounded-md p-0.5 absolute top-3 right-3">
                      <button onClick={() => { setEditingBadge(badge); setBadgeModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete('badge', badge.badge_name, () => deleteBadge.mutate(badge.id))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Authorize>
                  <div className="w-20 h-20 bg-gray-50 rounded-full border-4 border-white shadow-md flex items-center justify-center mb-4 overflow-hidden mt-2">
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.badge_name} className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{badge.badge_name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{badge.description}</p>
                  <div className="mt-auto w-full pt-3 border-t border-gray-100 flex justify-center">
                    <span className="flex items-center text-gray-700 font-semibold text-sm">
                      Unlocks at <Zap className="w-3.5 h-3.5 mx-1 text-primary" /> {badge.unlock_xp_threshold.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <QuestModal 
        isOpen={isQuestModalOpen} 
        onClose={() => { setQuestModalOpen(false); setEditingQuest(null); }} 
        onSubmit={(d) => saveQuest.mutate(d)} 
        isPending={saveQuest.isPending}
        initialData={editingQuest}
      />
      <BadgeModal 
        isOpen={isBadgeModalOpen} 
        onClose={() => { setBadgeModalOpen(false); setEditingBadge(null); }} 
        onSubmit={(d) => saveBadge.mutate(d)} 
        isPending={saveBadge.isPending}
        initialData={editingBadge}
      />
    </div>
  );
};