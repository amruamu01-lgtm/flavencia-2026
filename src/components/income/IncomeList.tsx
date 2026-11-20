import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileDown,
  ExternalLink,
  Receipt,
  FileText
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AddIncomeModal } from './AddIncomeModal';
import { exportIncomeToExcel } from '../../services/exportExcel';
import { generateIncomeReportPdf } from '../../services/exportPdf';

export const IncomeList: React.FC = () => {
  const { filteredIncome, categoryList, accountList } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filtered income rows
  const displayIncome = filteredIncome.filter(item => {
    const matchSearch =
      item.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.incomeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchMethod = selectedMethod === 'ALL' || item.paymentMethod === selectedMethod;

    return matchSearch && matchCategory && matchMethod;
  });

  const totalFilteredAmount = displayIncome.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const getCategoryName = (id: string) => {
    const cat = categoryList.find(c => c.categoryId === id);
    return cat ? cat.categoryName : id;
  };

  const getAccountName = (id: string) => {
    const acc = accountList.find(a => a.accountId === id);
    return acc ? acc.accountName : id;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Income Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {displayIncome.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total Receipts in Selection: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(totalFilteredAmount)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Excel */}
          <button
            onClick={() => exportIncomeToExcel(displayIncome)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-500" />
            Excel
          </button>

          {/* Export PDF */}
          <button
            onClick={() => generateIncomeReportPdf(displayIncome, 'FLAVENCIA 2026 - Income Statement')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-gold-500" />
            PDF
          </button>

          {/* Record Income Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-gold-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Record Income
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by source, description, reference, ID..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Categories</option>
            {categoryList
              .filter(c => c.categoryType === 'INCOME')
              .map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
          </select>
        </div>

        {/* Method Filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#191921] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CARD">Card</option>
          </select>
        </div>
      </div>

      {/* Income Records Table */}
      <div className="bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {displayIncome.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No income entries match your search or filter criteria.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Record Income" to add a new receipt directly to the books.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Income ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Received From</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Deposit Account</th>
                  <th className="py-3 px-4">Method / Ref</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {displayIncome.map(item => (
                  <tr key={item.incomeId} className="hover:bg-slate-50/50 dark:hover:bg-[#171720] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {item.incomeId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.sourceName}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {getAccountName(item.accountId)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <div>{item.paymentMethod}</div>
                      {item.referenceNumber && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Ref: {item.referenceNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.receiptUrl ? (
                        <a
                          href={item.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gold-600 dark:text-gold-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddIncomeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};
