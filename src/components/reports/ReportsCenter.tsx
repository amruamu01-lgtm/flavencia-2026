import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  generateFinalSettlementPdf,
  generateIncomeReportPdf,
  generateExpenseReportPdf,
  generateTransactionLedgerPdf
} from '../../services/exportPdf';
import {
  exportIncomeToExcel,
  exportExpensesToExcel,
  exportTransactionsToExcel,
  exportFullFestivalWorkbook
} from '../../services/exportExcel';

type ReportType =
  | 'TOTAL_INCOME'
  | 'TOTAL_EXPENSES'
  | 'CATEGORY_INCOME'
  | 'CATEGORY_EXPENSE'
  | 'DAILY_FINANCIAL'
  | 'MONTHLY_FINANCIAL'
  | 'YEARLY_FINANCIAL'
  | 'ACCOUNT_LEDGER'
  | 'PAYMENT_METHOD'
  | 'OUTSTANDING_EXPENSES'
  | 'PARTIALLY_PAID'
  | 'UNPAID_EXPENSES'
  | 'BUDGET_UTILIZATION'
  | 'COMPLETE_STATEMENT';

interface ReportMeta {
  id: ReportType;
  title: string;
  category: 'Overview' | 'Detailed' | 'Audit';
  description: string;
}

const REPORT_CATALOG: ReportMeta[] = [
  { id: 'COMPLETE_STATEMENT', title: '14. Complete Festival Financial Statement', category: 'Overview', description: 'Comprehensive audited master balance statement for FLAVENCIA 2026' },
  { id: 'TOTAL_INCOME', title: '1. Total Income Report', category: 'Overview', description: 'All gross receipts, sponsors, registrations, and patron donations' },
  { id: 'TOTAL_EXPENSES', title: '2. Total Expense Report', category: 'Overview', description: 'All festival expenditures, disbursements, and commitments' },
  { id: 'CATEGORY_INCOME', title: '3. Category-Wise Income Report', category: 'Detailed', description: 'Collections segmented by income sources' },
  { id: 'CATEGORY_EXPENSE', title: '4. Category-Wise Expense Report', category: 'Detailed', description: 'Paid disbursements grouped by operational budget categories' },
  { id: 'DAILY_FINANCIAL', title: '5. Daily Financial Report', category: 'Detailed', description: 'Day-to-day cashflow summary' },
  { id: 'MONTHLY_FINANCIAL', title: '6. Monthly Financial Report', category: 'Detailed', description: 'Month-by-month financial velocity' },
  { id: 'YEARLY_FINANCIAL', title: '7. Yearly Financial Report', category: 'Detailed', description: 'Fiscal year cumulative totals' },
  { id: 'ACCOUNT_LEDGER', title: '8. Account-Wise Ledger', category: 'Audit', description: 'Individual transaction ledgers for Cash, Bank, and UPI' },
  { id: 'PAYMENT_METHOD', title: '9. Payment Method Report', category: 'Detailed', description: 'Breakdown across Cash, Bank Transfer, UPI, Cheque, and Card' },
  { id: 'OUTSTANDING_EXPENSES', title: '10. Outstanding Expense Report', category: 'Audit', description: 'All vendor liabilities with pending balance amounts' },
  { id: 'PARTIALLY_PAID', title: '11. Partially Paid Expense Report', category: 'Audit', description: 'Bills where token/partial installments have been released' },
  { id: 'UNPAID_EXPENSES', title: '12. Unpaid Expense Report', category: 'Audit', description: 'Bills with ₹0 paid amount awaiting full settlement' },
  { id: 'BUDGET_UTILIZATION', title: '13. Budget Utilization Report', category: 'Overview', description: 'Category budget variance and overspending alerts' },
];

export const ReportsCenter: React.FC = () => {
  const {
    incomeList,
    expenseList,
    paymentList,
    transactionList,
    accountList,
    categoryList,
    budgetList,
    transferList,
    finalSettlementData
  } = useFinance();

  const [activeReport, setActiveReport] = useState<ReportType>('COMPLETE_STATEMENT');
  const [selectedAccountId, setSelectedAccountId] = useState('ALL');

  // Trigger exports based on active report
  const handleExportPdf = () => {
    switch (activeReport) {
      case 'COMPLETE_STATEMENT':
        generateFinalSettlementPdf(finalSettlementData);
        break;
      case 'TOTAL_INCOME':
      case 'CATEGORY_INCOME':
        generateIncomeReportPdf(incomeList, 'FLAVENCIA 2026 - Income Statement');
        break;
      case 'TOTAL_EXPENSES':
      case 'CATEGORY_EXPENSE':
        generateExpenseReportPdf(expenseList, 'FLAVENCIA 2026 - Expense Statement');
        break;
      case 'OUTSTANDING_EXPENSES':
        generateExpenseReportPdf(expenseList.filter(e => e.balanceAmount > 0), 'Outstanding Liabilities Statement');
        break;
      case 'PARTIALLY_PAID':
        generateExpenseReportPdf(expenseList.filter(e => e.paymentStatus === 'PARTIALLY PAID'), 'Partially Paid Expenses Statement');
        break;
      case 'UNPAID_EXPENSES':
        generateExpenseReportPdf(expenseList.filter(e => e.paymentStatus === 'UNPAID'), 'Unpaid Bills Statement');
        break;
      default:
        generateTransactionLedgerPdf(transactionList, 'FLAVENCIA 2026 - Financial Statement');
        break;
    }
  };

  const handleExportExcel = () => {
    switch (activeReport) {
      case 'COMPLETE_STATEMENT':
        exportFullFestivalWorkbook(incomeList, expenseList, paymentList, transactionList, accountList, budgetList, transferList);
        break;
      case 'TOTAL_INCOME':
      case 'CATEGORY_INCOME':
        exportIncomeToExcel(incomeList);
        break;
      case 'TOTAL_EXPENSES':
      case 'CATEGORY_EXPENSE':
      case 'OUTSTANDING_EXPENSES':
      case 'PARTIALLY_PAID':
      case 'UNPAID_EXPENSES':
        exportExpensesToExcel(expenseList);
        break;
      default:
        exportTransactionsToExcel(transactionList);
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentMeta = REPORT_CATALOG.find(r => r.id === activeReport);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Financial Reports Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
              14 Official Reports
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-grade reporting engine with PDF, Excel, and Print exports
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export Excel
          </button>

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <FileText className="w-4 h-4 text-gold-500" />
            Export PDF
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Report Selector Catalog */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 max-h-[680px] overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-2">
            Select Accounting Report
          </div>
          {REPORT_CATALOG.map(item => {
            const isSelected = activeReport === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveReport(item.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col ${
                  isSelected
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A1A22]'
                }`}
              >
                <span className="truncate">{item.title}</span>
                <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Active Report Interactive Preview */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Header of Preview */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 block mb-1">
                FLAVENCIA 2026 • OFFICIAL STATEMENT
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {currentMeta?.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentMeta?.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">
                Generated: {formatDate(new Date().toISOString().split('T')[0])}
              </span>
            </div>
          </div>

          {/* Report Specific Renderers */}
          {activeReport === 'COMPLETE_STATEMENT' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Income</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(finalSettlementData.grandTotalIncome)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Paid Expenses</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(finalSettlementData.grandTotalPaidExpenses)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Net Liquid Surplus</span>
                  <span className="text-lg font-bold text-gold-500">
                    {formatCurrency(finalSettlementData.netAvailableBalance)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Outstanding Bills</span>
                  <span className="text-lg font-bold text-amber-500">
                    {formatCurrency(finalSettlementData.totalOutstandingAmount)}
                  </span>
                </div>
              </div>

              {/* Accounts Position */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Account-Wise Closing Liquid Balances
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Account Name</th>
                        <th className="py-2.5 px-3 text-right">Closing Balance</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {finalSettlementData.accountsBreakdown.map(acc => (
                        <tr key={acc.accountName}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{acc.accountName}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(acc.balance)}
                          </td>
                          <td className="py-2.5 px-3 text-center text-[10px] text-emerald-500 font-semibold">
                            Reconciled
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'TOTAL_INCOME' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Income ID</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {incomeList.map(i => (
                    <tr key={i.incomeId}>
                      <td className="py-2.5 px-3">{formatDate(i.date)}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{i.incomeId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{i.sourceName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{i.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(i.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'TOTAL_EXPENSES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Item / Vendor</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Total Bill</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {expenseList.map(e => (
                    <tr key={e.expenseId}>
                      <td className="py-2.5 px-3">{formatDate(e.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {e.itemName} ({e.vendorName})
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[10px]">{e.paymentStatus}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(e.totalAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(e.paidAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-500">
                        {formatCurrency(e.balanceAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeReport === 'OUTSTANDING_EXPENSES' || activeReport === 'UNPAID_EXPENSES' || activeReport === 'PARTIALLY_PAID') && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Expense ID</th>
                    <th className="py-2.5 px-3">Vendor / Item</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Bill Total</th>
                    <th className="py-2.5 px-3 text-right">Paid Amount</th>
                    <th className="py-2.5 px-3 text-right">Pending Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {expenseList
                    .filter(e => {
                      if (activeReport === 'UNPAID_EXPENSES') return e.paymentStatus === 'UNPAID';
                      if (activeReport === 'PARTIALLY_PAID') return e.paymentStatus === 'PARTIALLY PAID';
                      return e.balanceAmount > 0;
                    })
                    .map(e => (
                      <tr key={e.expenseId}>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{e.expenseId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {e.itemName} ({e.vendorName})
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[10px] text-amber-500">{e.paymentStatus}</td>
                        <td className="py-2.5 px-3 text-right">{formatCurrency(e.totalAmount)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-500 font-semibold">{formatCurrency(e.paidAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-500">{formatCurrency(e.balanceAmount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'BUDGET_UTILIZATION' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#171720] border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Budget Limit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Actual Paid (₹)</th>
                    <th className="py-2.5 px-3 text-right">Variance / Remaining</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {budgetList.map(b => {
                    const cat = categoryList.find(c => c.categoryId === b.categoryId);
                    const spent = expenseList
                      .filter(e => e.categoryId === b.categoryId)
                      .reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);
                    const remaining = b.budgetAmount - spent;
                    const isExceeded = remaining < 0;

                    return (
                      <tr key={b.budgetId}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {cat ? cat.categoryName : b.categoryId}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">{formatCurrency(b.budgetAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-500">{formatCurrency(spent)}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isExceeded ? 'text-red-500' : 'text-emerald-500'}`}>
                          {isExceeded ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-[10px] font-bold">
                          {isExceeded ? 'EXCEEDED' : spent / b.budgetAmount >= 0.8 ? 'WARNING' : 'OK'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
