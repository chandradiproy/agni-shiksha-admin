// src/features/moderation/components/DoubtCard.tsx
import React from 'react';
import { AlertTriangle, MessageSquare, Trash2, Copy, Clock, CheckCircle, HelpCircle, FlagOff } from 'lucide-react';
import type { Doubt } from '../types';
import { useUIStore } from '../../../store/uiStore';

interface DoubtCardProps {
  doubt: Doubt;
  onDelete: (id: string, title: string) => void;
  onUpdateStatus: (id: string, data: { is_resolved?: boolean; is_flagged?: boolean }) => void;
}

export const DoubtCard: React.FC<DoubtCardProps> = ({ doubt, onDelete, onUpdateStatus }) => {
  const addToast = useUIStore(state => state.addToast);

  const handleCopyUserId = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(doubt.user.id);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = doubt.user.id;
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { console.error(err); }
      document.body.removeChild(textArea);
    }
    addToast('User ID copied! Go to User Management to ban.', 'success');
  };

  const displayText = doubt.description || doubt.content || 'No description provided.';

  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${doubt.is_flagged ? 'border-red-300 bg-red-50/20' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
            {doubt.user.full_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{doubt.user.full_name || 'Unknown User'}</h4>
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(doubt.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          {doubt.is_flagged && (
            <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center shadow-sm uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
            </span>
          )}
          {doubt.is_resolved ? (
            <span className="bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center shadow-sm uppercase tracking-wider">
              <CheckCircle className="w-3 h-3 mr-1" /> Resolved
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center shadow-sm uppercase tracking-wider">
              <HelpCircle className="w-3 h-3 mr-1" /> Unresolved
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-5">
        {doubt.subject && (
          <span className="inline-block bg-primary-light text-primary-hover text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
            {doubt.subject}
          </span>
        )}
        <h3 className="font-bold text-gray-900 text-base mb-1.5">{doubt.title}</h3>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap line-clamp-4">
          {displayText}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
        <div className="text-sm text-gray-600 font-medium flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 w-fit shrink-0">
          <MessageSquare className="w-4 h-4 mr-1.5 text-primary" />
          {doubt._count.answers} Answers
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {doubt.is_flagged && (
            <button 
              onClick={() => onUpdateStatus(doubt.id, { is_flagged: false })}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
              title="Remove Flag (Mark as Safe)"
            >
              <FlagOff className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => onUpdateStatus(doubt.id, { is_resolved: !doubt.is_resolved })}
            className={`p-1.5 rounded-lg transition-colors border ${doubt.is_resolved ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200' : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200'}`}
            title={doubt.is_resolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
          >
            {doubt.is_resolved ? <HelpCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleCopyUserId}
            className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors border border-gray-200"
            title="Copy User ID to ban"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onDelete(doubt.id, doubt.title)}
            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-100"
            title="Delete Post permanently"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};