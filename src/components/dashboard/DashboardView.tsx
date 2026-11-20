import React, { useState, Suspense } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Award,
  Plus,
  Sparkles
} from 'lucide-react';
import { FinancialSummaryCards } from './FinancialSummaryCards';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { AddIncomeModal } from '../income/AddIncomeModal';
import { AddExpenseModal } from '../expenses/AddExpenseModal';
import { TransferModal } from '../accounts/TransferModal';
import { NavigationTab } from '../layout/Sidebar';

// Lazy-load ChartsSection to isolate Recharts from initial load
const ChartsSection = React.lazy(() =>
  import('./ChartsSection').then(m => ({ default: m.ChartsSection }))
);

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Quick Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Quick Financial Operations:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-[#16A34A] hover:bg-emerald-100 border border-emerald-200 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            + Record Income
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-[#DC2626] hover:bg-rose-100 border border-rose-200 transition-all"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            - Book Expense
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Funds
          </button>

          <button
            onClick={() => onNavigate('settlement')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-all shadow-none"
          >
            <Award className="w-3.5 h-3.5" />
            Final Settlement
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <FinancialSummaryCards />

      {/* Analytics Charts with Lazy Suspense Fallback */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="h-72 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                Loading Financial Velocity Charts...
              </span>
            </div>
            <div className="h-72 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
                Loading Expense Allocation Charts...
              </span>
            </div>
          </div>
        }
      >
        <ChartsSection />
      </Suspense>

      {/* Recent Ledger Transactions */}
      <RecentTransactionsTable onViewAll={() => onNavigate('transactions')} />

      {/* Modals */}
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />
      <AddExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} />
      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  );
};
