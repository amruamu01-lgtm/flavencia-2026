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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Quick Financial Operations:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            + Record Income
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            - Book Expense
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gold-500/10 text-gold-500 dark:text-gold-400 hover:bg-gold-500/20 border border-gold-500/30 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Funds
          </button>

          <button
            onClick={() => onNavigate('settlement')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-gold-500/20 transition-all"
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
            <div className="h-72 rounded-2xl bg-slate-100 dark:bg-[#121217] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                Loading Financial Velocity Charts...
              </span>
            </div>
            <div className="h-72 rounded-2xl bg-slate-100 dark:bg-[#121217] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
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
