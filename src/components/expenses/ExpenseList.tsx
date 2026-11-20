import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileDown,
  ExternalLink,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseRecord } from '../../types/financial';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { AddExpenseModal } from './AddExpenseModal';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { exportExpensesToExcel } from '../../services/exportExcel';
import { generateExpenseReportPdf } from '../../services/exportPdf';

export const ExpenseList: React.FC = () => {
  const { filteredExpenses, categoryList } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<ExpenseRecord | null>(null);

  const displayExpenses = filteredExpenses.filter(item => {
    const matchSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || item.paymentStatus === selectedStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  const totalBills = displayExpenses.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
  const totalPaid = displayExpenses.reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);
  const totalBalance = displayExpenses.reduce((s, e) => s + (Number(e.balanceAmount) || 0), 0);

  const getCategoryName = (id: string) => {
    const cat = categoryList.find(c => c.categoryId === id);
    return cat ? cat.categoryName : id;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Expense Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {displayExpenses.length} Expenses
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total Bills: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(totalBills)}</strong> • Paid:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</strong> • Pending:{' '}
            <strong className="text-amber-500">{formatCurrency(totalBalance)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Excel */}
          <button
            onClick={() => exportExpensesToExcel(displayExpenses)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-500" />
            Excel
          </button>

          {/* Export PDF */}
          <button
            onClick={() => generateExpenseReportPdf(displayExpenses, 'FLAVENCIA 2026 - Expense Statement')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-gold-500" />
            PDF
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-amber-700 text-white hover:brightness-110 shadow-md shadow-rose-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Book Expense
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by item, vendor, expense ID, notes..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Expense Categories</option>
            {categoryList
              .filter(c => c.categoryType === 'EXPENSE')
              .map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="UNPAID">○ UNPAID</option>
            <option value="PARTIALLY PAID">◐ PARTIALLY PAID</option>
            <option value="PAID">● PAID</option>
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {displayExpenses.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No expenses match your search or filter settings.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Book Expense" to directly log a new festival expenditure.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Expense ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Item / Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Bill</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Action / Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {displayExpenses.map(item => (
                  <tr key={item.expenseId} className="hover:bg-slate-50/50 dark:hover:bg-[#171720] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {item.expenseId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.itemName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.vendorName} {item.paidBy ? `• By ${item.paidBy}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge type="status" value={item.paymentStatus} />
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-500">
                      {formatCurrency(item.balanceAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => setPaymentTarget(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gold-500/10 text-gold-500 dark:text-gold-400 hover:bg-gold-500/20 border border-gold-500/30 transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                        {item.billUrl && (
                          <a
                            href={item.billUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                            title="View Attached Bill in Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {/* Record Payment Modal */}
      {paymentTarget && (
        <RecordPaymentModal
          isOpen={!!paymentTarget}
          targetExpense={paymentTarget}
          onClose={() => setPaymentTarget(null)}
        />
      )}
    </div>
  );
};
