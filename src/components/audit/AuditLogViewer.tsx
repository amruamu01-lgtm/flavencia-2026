import React, { useState } from 'react';
import { History, Search, ShieldAlert, User, Clock, FileText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogViewer: React.FC = () => {
  const { auditLogList } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const displayLogs = auditLogList.filter(log => {
    const matchSearch =
      log.logId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchModule = selectedModule === 'ALL' || log.module === selectedModule;

    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Audit Logs & Activity History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
              {displayLogs.length} Events
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic-style audit trail of every financial mutation and write operation
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search log ID, action, record ID, user, data changes..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500/50"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All System Modules</option>
            <option value="INCOME">INCOME</option>
            <option value="EXPENSES">EXPENSES</option>
            <option value="PAYMENTS">PAYMENTS</option>
            <option value="ACCOUNTS">ACCOUNTS</option>
            <option value="BUDGETS">BUDGETS</option>
            <option value="CATEGORIES">CATEGORIES</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {displayLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No audit logs recorded for this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {displayLogs.map(log => (
                  <tr key={log.logId} className="hover:bg-slate-50/50 dark:hover:bg-[#171720] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {log.logId}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-500/10 text-gold-500 dark:text-gold-400 border border-gold-500/20 font-mono">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.recordId}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.performedBy}
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate text-slate-600 dark:text-slate-400 text-[11px]" title={log.newValue || log.oldValue}>
                      {log.newValue ? log.newValue : log.oldValue ? `Old: ${log.oldValue}` : 'Action logged'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
