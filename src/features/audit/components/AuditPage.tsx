// src/features/audit/components/AuditPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditService } from '../services/audit.service';
import type { AuditLog } from '../types';

export const AuditPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ 
    queryKey: ['audit_logs', page], 
    queryFn: () => auditService.getLogs(page, 10) 
  });
  
  const logs = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    // Force the container to take the full viewport height minus layout padding
    <div className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] space-y-4">
      
      {/* Header - shrink-0 prevents it from getting compressed */}
      <div className="shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> System Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Read-only forensic ledger of administrative actions.</p>
        </div>
      </div>

      {/* Main Card Container - min-h-0 is CRITICAL to enable internal scrolling */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
        
        {/* Table Scroll Area */}
        <div className="overflow-auto flex-1 relative bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center h-full min-h-[200px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/95 backdrop-blur-sm text-[10px] uppercase font-bold text-gray-500 tracking-widest sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Timestamp</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Administrator</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Action</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Target ID</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors font-medium">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-gray-400 font-mono">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-gray-900 font-bold">{log.admin?.name || 'System'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{log.admin?.role}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200 text-[10px] font-bold uppercase tracking-tighter">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs font-mono text-primary truncate max-w-[150px]">{log.target_id}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="bg-gray-50 p-2 rounded text-[10px] font-mono text-gray-500 border border-gray-100 max-w-xs overflow-hidden truncate" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No audit logs found for this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer - shrink-0 anchors it firmly to the bottom */}
        <div className="shrink-0 p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 italic hidden sm:block">Logs are immutable and cannot be deleted or modified.</p>
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