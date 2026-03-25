// src/features/users/components/UserDrawer.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldAlert, User as UserIcon, Calendar, Mail, 
  Phone, Crown, Zap, Diamond, Flame, Clock, Target, CheckCircle2, XCircle
} from 'lucide-react';
import { type User } from '../types';
import { Authorize } from '../../../components/guard/Authorize';

interface UserDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onBan: (id: string, reason?: string) => void;
  onForumBan: (id: string) => void;
  onRevokeSessions: (id: string) => void;
  isActionLoading: boolean;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({ user, isOpen, onClose, onBan, onForumBan, onRevokeSessions, isActionLoading }) => {
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [isConfirmingBan, setIsConfirmingBan] = useState(false);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setDisplayUser(user);
    }

    if (!isOpen) {
      setIsConfirmingBan(false);
      setBanReason('');
    }
  }, [isOpen, user]);

  if (!displayUser) return null;

  const displayName = displayUser.full_name || 'Unknown User';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-surface">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-primary" />
                Student Profile
              </h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Header section */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary-light text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>

                <span className={`mt-2 px-3 py-1 text-xs font-semibold rounded-full flex items-center ${displayUser.is_premium ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                  {displayUser.is_premium ? (
                    <><Crown className="w-3 h-3 mr-1" /> Premium Member</>
                  ) : (
                    'Free Tier'
                  )}
                </span>
              </div>

              {/* Gamification Stats Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center text-center transition-transform hover:scale-105">
                  <Zap className="w-5 h-5 text-indigo-500 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Level</span>
                  <span className="text-lg font-bold text-indigo-900">{displayUser.level}</span>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex flex-col items-center text-center transition-transform hover:scale-105">
                  <Flame className="w-5 h-5 text-orange-500 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Streak</span>
                  <span className="text-lg font-bold text-orange-900">{displayUser.current_streak}</span>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center text-center transition-transform hover:scale-105">
                  <Diamond className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Gems</span>
                  <span className="text-lg font-bold text-blue-900">{displayUser.gems}</span>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col items-center text-center transition-transform hover:scale-105">
                  <Target className="w-5 h-5 text-green-500 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Tests</span>
                  <span className="text-lg font-bold text-green-900">{displayUser._count?.test_attempts || 0}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Contact Details</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      {displayUser.email}
                    </div>
                    {displayUser.is_email_verified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      {displayUser.phone_number || 'Not provided'}
                    </div>
                    {displayUser.is_phone_verified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    Joined {new Date(displayUser.created_at).toLocaleDateString()}
                  </div>

                </div>
              </div>

              {/* Study Profile */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Study Profile & Engagement</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">

                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Language</span>
                    <span className="font-medium text-gray-900 capitalize">{displayUser.study_language || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Preparation</span>
                    <span className="font-medium text-gray-900 capitalize">{displayUser.prep_level || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Daily Goal</span>
                    <span className="font-medium text-gray-900 flex items-center"><Clock className="w-3 h-3 mr-1 text-gray-400"/> {displayUser.daily_study_hours} hrs</span>
                  </div>

                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Doubts Asked</span>
                    <span className="font-medium text-gray-900">{displayUser._count?.doubts || 0}</span>
                  </div>

                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Account Status</h4>
                <div className="flex gap-2 flex-wrap mb-2">

                  {displayUser.is_banned ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md flex items-center shadow-sm">
                      <ShieldAlert className="w-3 h-3 mr-1" /> App Banned
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md shadow-sm">Active</span>
                  )}

                  {displayUser.forum_banned && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md flex items-center shadow-sm">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Forum Banned
                    </span>
                  )}

                </div>

                {displayUser.is_banned && displayUser.ban_reason && (
                  <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 mt-2">
                    <span className="font-semibold block mb-1">Ban Reason:</span>
                    {displayUser.ban_reason}
                  </div>
                )}

              </div>
            </div>

            {/* Action Area */}
            <Authorize allowedRoles={['super_admin', 'support_moderator']}>
              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3">

                <button
                  onClick={() => onForumBan(displayUser.id)}
                  disabled={isActionLoading}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm ${
                    displayUser.forum_banned ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {displayUser.forum_banned ? 'Lift Forum Ban' : 'Issue Forum Ban (Silent)'}
                </button>

                <button
                  onClick={() => onRevokeSessions(displayUser.id)}
                  disabled={isActionLoading}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm bg-purple-100 text-purple-700 hover:bg-purple-200 mt-3"
                >
                  <ShieldAlert className="w-4 h-4 mr-2 inline" /> Force Logout (Revoke Sessions)
                </button>

                {!displayUser.is_banned && isConfirmingBan ? (

                  <div className="space-y-3 p-4 bg-red-50 rounded-xl border border-red-100 transition-all">

                    <label className="block text-xs font-semibold text-red-900">Reason for Ban <span className="text-red-500">*</span></label>

                    <textarea
                      className="w-full text-sm p-2.5 border border-red-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
                      rows={2}
                      placeholder="E.g., Repeated violation of community guidelines..."
                      value={banReason}
                      onChange={e => setBanReason(e.target.value)}
                      disabled={isActionLoading}
                    />

                    <div className="flex gap-2">

                      <button
                        onClick={() => { setIsConfirmingBan(false); setBanReason(''); }}
                        disabled={isActionLoading}
                        className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>

                      <button
                        disabled={isActionLoading || !banReason.trim()}
                        onClick={() => onBan(displayUser.id, banReason)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        Confirm Ban
                      </button>

                    </div>

                  </div>

                ) : (

                  <button
                    onClick={() => displayUser.is_banned ? onBan(displayUser.id) : setIsConfirmingBan(true)}
                    disabled={isActionLoading}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm ${
                      displayUser.is_banned ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {displayUser.is_banned ? 'Unban User' : 'Ban User (Block Access)'}
                  </button>

                )}

              </div>
            </Authorize>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};