import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Award
} from 'lucide-react';
import { FinancialSummaryCards } from './FinancialSummaryCards';
import { AddIncomeModal } from '../income/AddIncomeModal';
import { AddExpenseModal } from '../expenses/AddExpenseModal';
import { TransferModal } from '../accounts/TransferModal';
import { NavigationTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  return (
    <div className="space-y-6">
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

      {/* Modals */}
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />
      <AddExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} />
      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  );
};
