// src/features/financial/components/FinancialPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, TrendingUp, CheckCircle, Users, XCircle, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert, Undo2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useUIStore } from '../../../store/uiStore';
import { financialService } from '../services/financial.service';
import type { PaymentRecord, SubscriptionRecord } from '../types';

const MySwal = withReactContent(Swal);

export const FinancialPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore(state => state.addToast);

  const [tab, setTab] = useState<'payments' | 'subscriptions'>('payments');
  const [page, setPage] = useState(1);

  const { data: summaryRes } = useQuery({ queryKey: ['financial_summary'], queryFn: financialService.getSummary });
  
  const { data: listRes, isLoading } = useQuery({ 
    queryKey: ['financial_list', tab, page], 
    // FIX: Removed the "10" arguments so it stops overriding the "status" parameter!
    queryFn: () => tab === 'payments' ? financialService.getPayments(page) : financialService.getSubscriptions(page) 
  });

  const summary = summaryRes?.data;
  const records = listRes?.data || [];
  const totalPages = listRes?.pagination?.totalPages || 1;

  // --- Mutations for Actions ---
  const verifyMutation = useMutation({
    mutationFn: financialService.verifyPayment,
    onSuccess: (res) => {
      addToast(res.message || 'Payment verified and synced successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['financial_list'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Verification failed.', 'error')
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financialService.revokeSubscription(id, reason),
    onSuccess: () => {
      MySwal.fire('Revoked!', 'The subscription has been terminated.', 'success');
      queryClient.invalidateQueries({ queryKey: ['financial_list'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to revoke subscription.', 'error')
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financialService.refundPayment(id, reason),
    onSuccess: () => {
      MySwal.fire('Refunded!', 'Payment marked as refunded and user access revoked.', 'success');
      queryClient.invalidateQueries({ queryKey: ['financial_list'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to process refund.', 'error')
  });

  // --- Handlers ---
  const handleRevoke = (id: string) => {
    MySwal.fire({
      title: 'Revoke Subscription?',
      text: "This will instantly remove the student's premium access. Please provide a reason for the audit log.",
      input: 'text',
      inputPlaceholder: 'Reason for revocation...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      confirmButtonText: 'Revoke Access',
      preConfirm: (reason) => {
        if (!reason) Swal.showValidationMessage('A reason is required');
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        revokeMutation.mutate({ id, reason: result.value });
      }
    });
  };

  const handleRefund = (id: string) => {
    MySwal.fire({
      title: 'Refund Payment?',
      text: "This will mark the payment as refunded AND instantly revoke the user's active subscription.",
      input: 'text',
      inputPlaceholder: 'Reason for refund...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      confirmButtonText: 'Process Refund',
      preConfirm: (reason) => {
        if (!reason) Swal.showValidationMessage('A reason is required');
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        refundMutation.mutate({ id, reason: result.value });
      }
    });
  };

  return (
    // Main wrapper restricted to viewport height to enable flex scrolling
    <div className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Financial Ledger</h1>
        <p className="text-xs sm:text-sm text-gray-500">Monitor revenue stream, active student subscriptions, and handle refunds.</p>
      </div>

      {/* Summary Row - Horizontally scrollable on mobile to prevent height overflow */}
      <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto shrink-0 pb-2 hide-scrollbar">
        <MetricCard className="min-w-[220px] lg:min-w-0" label="Total Revenue" value={`₹${summary?.total_revenue_inr.toLocaleString() || 0}`} icon={TrendingUp} color="green" />
        <MetricCard className="min-w-[220px] lg:min-w-0" label="Successful Payments" value={summary?.total_successful_payments.toLocaleString() || '0'} icon={CheckCircle} color="blue" />
        <MetricCard className="min-w-[220px] lg:min-w-0" label="Active Subs" value={summary?.active_subscribers.toLocaleString() || '0'} icon={Users} color="orange" />
        <MetricCard className="min-w-[220px] lg:min-w-0" label="Expired / Revoked" value={summary?.expired_subscribers.toLocaleString() || '0'} icon={XCircle} color="red" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0 flex-1 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button onClick={() => { setTab('payments'); setPage(1); }} className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${tab === 'payments' ? 'border-primary text-primary bg-primary-light/10' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Transaction History</button>
          <button onClick={() => { setTab('subscriptions'); setPage(1); }} className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${tab === 'subscriptions' ? 'border-primary text-primary bg-primary-light/10' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Membership Ledger</button>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-auto flex-1 relative bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center h-full min-h-[200px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/95 backdrop-blur-sm text-[10px] uppercase font-bold text-gray-500 tracking-widest sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">User Details</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Plan</th>
                  {tab === 'payments' ? (
                    <><th className="px-4 sm:px-6 py-3 sm:py-4">Amount</th><th className="px-4 sm:px-6 py-3 sm:py-4">Order ID</th><th className="px-4 sm:px-6 py-3 sm:py-4">Status</th></>
                  ) : (
                    <><th className="px-4 sm:px-6 py-3 sm:py-4">Validity Range</th><th className="px-4 sm:px-6 py-3 sm:py-4">Status</th></>
                  )}
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Date / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="font-bold text-gray-900">{row.user?.full_name || 'Legacy User'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{row.user?.email}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-700">{row.plan?.name}</td>
                    
                    {tab === 'payments' ? (
                      <>
                        <td className={`px-4 sm:px-6 py-3 sm:py-4 font-black ${row.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          ₹{row.amount_paise / 100}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-mono text-gray-400">{row.gateway_order_id}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border 
                            ${row.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' 
                            : row.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-400">{new Date(row.created_at).toLocaleDateString()}</span>
                            
                            <div className="flex items-center gap-2">
                              {row.status !== 'success' && row.status !== 'refunded' && (
                                <button 
                                  onClick={() => verifyMutation.mutate(row.id)}
                                  disabled={verifyMutation.isPending}
                                  className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 hover:bg-blue-100 flex items-center transition-colors disabled:opacity-50 shadow-sm"
                                >
                                  <RefreshCw className={`w-3 h-3 mr-1 ${verifyMutation.isPending && verifyMutation.variables === row.id ? 'animate-spin' : ''}`} /> 
                                  Verify
                                </button>
                              )}

                              {row.status === 'success' && (
                                <button 
                                  onClick={() => handleRefund(row.id)}
                                  className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 hover:bg-red-100 flex items-center transition-colors shadow-sm"
                                >
                                  <Undo2 className="w-3 h-3 mr-1" /> 
                                  Refund
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                            <span className="text-green-600">{new Date(row.start_date).toLocaleDateString()}</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-red-600">{new Date(row.end_date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border 
                            ${row.status === 'active' ? 'bg-primary-light text-primary border-primary-light' 
                            : row.status === 'revoked' ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-400">-</span>
                            {row.status === 'active' && (
                              <button 
                                onClick={() => handleRevoke(row.id)}
                                className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 hover:bg-red-100 flex items-center transition-colors shadow-sm"
                              >
                                <ShieldAlert className="w-3 h-3 mr-1" /> 
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Fixed Pagination Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <p className="text-[10px] text-gray-500 font-medium tracking-tight italic hidden sm:block">Showing latest financial activities for Agni Shiksha.</p>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end items-center">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-2 sm:px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors flex items-center shadow-sm">
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline text-xs font-semibold text-gray-700">Prev</span>
            </button>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest sm:px-2">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-2 sm:px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors flex items-center shadow-sm">
              <span className="hidden sm:inline text-xs font-semibold text-gray-700">Next</span>
              <ChevronRight className="w-4 h-4 sm:ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, icon: React.ElementType, color: string, className?: string }> = ({ label, value, icon: Icon, color, className = '' }) => {
  const colors: any = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <div className={`p-4 sm:p-5 rounded-xl border bg-white flex items-center shadow-sm shrink-0 ${className}`}>
      <div className={`p-2.5 sm:p-3 rounded-lg mr-3 sm:mr-4 ${colors[color]}`}><Icon className="w-5 h-5 sm:w-6 sm:h-6" /></div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5 sm:mb-1">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
};