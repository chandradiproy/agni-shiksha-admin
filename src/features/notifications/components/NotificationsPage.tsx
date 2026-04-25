import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Bell, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { notificationService } from '../services/notification.service';
import { useUIStore } from '../../../store/uiStore';
import { Authorize } from '../../../components/guard/Authorize';
import type { CreateNotificationPayload } from '../types';

const MySwal = withReactContent(Swal);

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'MARKETING' | 'ALERT' | 'SYSTEM' | 'NEWS'>('MARKETING');
  const [audienceType, setAudienceType] = useState<'ALL' | 'USERS' | 'EXAM'>('ALL');
  const [sendPush, setSendPush] = useState(true);

  // --- Queries ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationService.getNotifications(page, 8),
    staleTime: 60000,
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (payload: CreateNotificationPayload) => notificationService.createNotification(payload),
    onSuccess: (res) => {
      addToast(`Notification sent successfully to ${res.recipient_count} users!`, 'success');
      setIsModalOpen(false);
      // Reset form
      setTitle(''); setBody('');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to send notification', 'error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      return addToast('Title and Message Body are required', 'error');
    }

    MySwal.fire({
      title: 'Broadcast Notification?',
      text: `This will instantly send a Push Alert to ${audienceType === 'ALL' ? 'ALL active users' : 'selected users'}. Proceed?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Send it!'
    }).then((result) => {
      if (result.isConfirmed) {
        createMutation.mutate({
          title, body, type, audience_type: audienceType, send_push: sendPush
        });
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Area — shrinks to fit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Push Notifications & Marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Broadcast real-time mobile push alerts to students.</p>
        </div>
        
        <Authorize allowedRoles={['super_admin', 'content_manager']}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors"
            >
              <Send className="w-4 h-4 mr-2" /> New Broadcast
            </button>
          </div>
        </Authorize>
      </div>

      {/* Table Content — scrolls independently */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-gray-500 text-sm">Loading broadcast history...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">
            Failed to load notification history. Please try again.
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No broadcasts sent yet.</p>
            <p className="text-gray-400 text-sm mt-1">Hit 'New Broadcast' to reach your students.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Sent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{item.body}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {item.audience_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Pagination Footer — always visible at bottom */}
      {data && data.pagination && (
        <div className="shrink-0 bg-white px-6 py-3 mt-3 border border-gray-200 rounded-xl flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-500 font-medium">
            Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              className="p-1.5 rounded bg-white border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* New Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">New Push Broadcast</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto w-full">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alert Title</label>
                  <input 
                    type="text" required 
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. UPSC Prelims Results Declared!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message Body</label>
                  <textarea 
                    required rows={3}
                    value={body} onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Type the expanded notification message..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message Type</label>
                    <select 
                      value={type} onChange={(e: any) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="MARKETING">Marketing / Promo</option>
                      <option value="ALERT">Critical Alert</option>
                      <option value="NEWS">News / Current Affairs</option>
                      <option value="SYSTEM">System Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Audience</label>
                    <select 
                      value={audienceType} onChange={(e: any) => setAudienceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="ALL">All Active Devices (Global)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center mt-2">
                  <input 
                    type="checkbox" 
                    id="sendPush" 
                    checked={sendPush} 
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="sendPush" className="ml-2 text-sm font-semibold text-gray-700">
                    Send Mobile Push Notification Payload
                  </label>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold flex items-center hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {createMutation.isPending ? 'Broadcasting...' : 'Blast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
