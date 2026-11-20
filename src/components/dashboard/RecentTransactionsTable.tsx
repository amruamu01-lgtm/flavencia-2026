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
    <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-[#1E3A5F]" />
            Recent Financial Transactions
          </h3>
          <p className="text-xs text-gray-500">
            Real-time ledger entries from income, payments, and transfers
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#1E3A5F] hover:underline flex items-center gap-1 transition-colors"
        >
          View Full Ledger
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          No transactions found for the selected period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {recent.map(t => (
                <tr key={t.transactionId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                    {formatDate(t.transactionDate)}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-gray-900 font-medium" title={t.description}>
                    {t.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge type="direction" value={t.direction} />
                  </td>
                  <td className="py-2.5 px-3 text-gray-700 font-semibold whitespace-nowrap">
                    {t.accountName || t.accountId}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                    t.direction === 'CREDIT' ? 'text-[#16A34A]' : 'text-[#DC2626]'
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
