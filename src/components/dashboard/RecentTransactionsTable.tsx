import React from 'react';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface RecentTransactionsTableProps {
  onViewAll: () => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ onViewAll }) => {
  const { filteredTransactions } = useFinance();
  const recent = filteredTransactions.slice(0, 8);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-gold-500" />
            Recent Financial Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time ledger entries from income, payments, and transfers
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 flex items-center gap-1 transition-colors"
        >
          View Full Ledger
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No transactions found for the selected period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Txn ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {recent.map(t => (
                <tr key={t.transactionId} className="hover:bg-slate-50/50 dark:hover:bg-[#171720] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {t.transactionId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {formatDate(t.transactionDate)}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-slate-900 dark:text-slate-100" title={t.description}>
                    {t.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge type="direction" value={t.direction} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {t.accountName || t.accountId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                    {t.paymentMethod}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${
                    t.direction === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {t.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
