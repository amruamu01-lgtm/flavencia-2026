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
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Expense Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
              {displayExpenses.length} Expenses
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Bills: <strong className="text-gray-900">{formatCurrency(totalBills)}</strong> • Paid:{' '}
            <strong className="text-[#16A34A]">{formatCurrency(totalPaid)}</strong> • Pending:{' '}
            <strong className="text-[#DC2626]">{formatCurrency(totalBalance)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Excel */}
          <button
            onClick={() => exportExpensesToExcel(displayExpenses)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-none"
          >
            <FileDown className="w-3.5 h-3.5 text-[#16A34A]" />
            Excel
          </button>

          {/* Export PDF */}
          <button
            onClick={() => generateExpenseReportPdf(displayExpenses, 'FLAVENCIA 2026 - Expense Statement')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-none"
          >
            <FileText className="w-3.5 h-3.5 text-[#1E3A5F]" />
            PDF
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A5F] hover:bg-[#172E4D] text-white shadow-none transition-all"
          >
            <Plus className="w-4 h-4" />
            Book Expense
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-none flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by item, vendor, expense ID, notes..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
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
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold focus:bg-white focus:border-[#1E3A5F]"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="UNPAID">○ UNPAID</option>
            <option value="PARTIALLY PAID">◐ PARTIALLY PAID</option>
            <option value="PAID">● PAID</option>
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-none overflow-hidden">
        {displayExpenses.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-600">
              No expenses match your search or filter settings.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Book Expense" to directly log a new festival expenditure.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-gray-100 font-medium">
                {displayExpenses.map(item => (
                  <tr key={item.expenseId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {item.expenseId}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{item.itemName}</div>
                      <div className="text-[11px] text-gray-500">
                        {item.vendorName} {item.paidBy ? `• By ${item.paidBy}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px]">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge type="status" value={item.paymentStatus} />
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#16A34A]">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#DC2626]">
                      {formatCurrency(item.balanceAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => setPaymentTarget(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-navy-50 text-[#1E3A5F] hover:bg-navy-100 border border-navy-200 transition-colors"
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
                            className="p-1 rounded text-gray-400 hover:text-[#1E3A5F]"
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
