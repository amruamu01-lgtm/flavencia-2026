import React, { useState } from 'react';
import {
  Search,
  FileDown,
  FileText,
  ReceiptText,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { exportTransactionsToExcel } from '../../services/exportExcel';
import { generateTransactionLedgerPdf } from '../../services/exportPdf';
import { TransactionType } from '../../types/financial';

export const TransactionLedger: React.FC = () => {
  const { filteredTransactions, accountList } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const displayTxns = filteredTransactions.filter(item => {
    const matchSearch =
      item.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.accountName && item.accountName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = selectedType === 'ALL' || item.transactionType === selectedType;
    const matchAccount = selectedAccount === 'ALL' || item.accountId === selectedAccount;

    return matchSearch && matchType && matchAccount;
  });

  // Totals for current filtered ledger
  const totalCredits = displayTxns
    .filter(t => t.direction === 'CREDIT')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const totalDebits = displayTxns
    .filter(t => t.direction === 'DEBIT')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(displayTxns.length / itemsPerPage));
  const paginatedTxns = displayTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Transaction Ledger</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
              {displayTxns.length} Entries
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total Credits: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalCredits)}</strong> • Total Debits:{' '}
            <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(totalDebits)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToExcel(displayTxns)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-500" />
            Excel
          </button>

          <button
            onClick={() => generateTransactionLedgerPdf(displayTxns, 'FLAVENCIA 2026 - Master Transaction Ledger')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-gold-500" />
            PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search txn ID, reference, description, account..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500/50"
          />
        </div>

        <div className="w-full md:w-52">
          <select
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="INCOME">INCOME (Credits)</option>
            <option value="EXPENSE_PAYMENT">EXPENSE PAYMENT (Debits)</option>
            <option value="TRANSFER_OUT">TRANSFER OUT</option>
            <option value="TRANSFER_IN">TRANSFER IN</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={selectedAccount}
            onChange={e => {
              setSelectedAccount(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Accounts</option>
            {accountList.map(a => (
              <option key={a.accountId} value={a.accountId}>
                {a.accountName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {displayTxns.length === 0 ? (
          <div className="py-16 text-center">
            <ReceiptText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No transactions match your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Credit (₹)</th>
                  <th className="py-3 px-4 text-right">Debit (₹)</th>
                  <th className="py-3 px-4 text-right">Running Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedTxns.map(t => (
                  <tr key={t.transactionId} className="hover:bg-slate-50/50 dark:hover:bg-[#171720] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {t.transactionId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {formatDate(t.transactionDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {t.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gold-600 dark:text-gold-400">
                      {t.referenceId || '-'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-900 dark:text-slate-100" title={t.description}>
                      {t.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                      {t.accountName || t.accountId}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {t.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {t.direction === 'CREDIT' ? `+${formatCurrency(t.amount)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                      {t.direction === 'DEBIT' ? `-${formatCurrency(t.amount)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900 dark:text-slate-100">
                      {t.runningBalance !== undefined ? formatCurrency(t.runningBalance) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Page {currentPage} of {totalPages} ({displayTxns.length} records)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
