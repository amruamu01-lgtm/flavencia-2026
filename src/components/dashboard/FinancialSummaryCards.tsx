import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Smartphone,
  AlertCircle,
  Receipt,
  Scale,
  Calendar,
  Gift,
  Award,
  Layers
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';

export const FinancialSummaryCards: React.FC = () => {
  const { dashboardStats, dateFilter } = useFinance();

  return (
    <div className="space-y-6">
      {/* Active Filter Banner */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>Financial Executive Summary</span>
          <span className="text-xs font-normal text-gray-500">
            ({dateFilter.label})
          </span>
        </h2>
      </div>

      {/* 8 Core Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Income */}
        <StatCard
          title="Total Income"
          value={formatCurrency(dashboardStats.totalIncome)}
          subtitle="All recorded festival receipts"
          icon={TrendingUp}
          variant="emerald"
          badge="Credit"
        />

        {/* 2. Total Paid Expenses */}
        <StatCard
          title="Total Paid Expenses"
          value={formatCurrency(dashboardStats.totalPaidExpenses)}
          subtitle="Actual payments disbursed"
          icon={TrendingDown}
          variant="rose"
          badge="Disbursed"
        />

        {/* 3. Net Available Balance */}
        <StatCard
          title="Net Available Balance"
          value={formatCurrency(dashboardStats.netAvailableBalance)}
          subtitle="Total Income - Paid Expenses"
          icon={Scale}
          variant={dashboardStats.netAvailableBalance >= 0 ? 'emerald' : 'rose'}
          badge={dashboardStats.netAvailableBalance >= 0 ? 'Surplus' : 'Deficit'}
        />

        {/* 4. Outstanding Expenses */}
        <StatCard
          title="Outstanding Expenses"
          value={formatCurrency(dashboardStats.outstandingExpenses)}
          subtitle={`${dashboardStats.totalUnpaidExpensesCount} unpaid/partial bills`}
          icon={AlertCircle}
          variant={dashboardStats.outstandingExpenses > 0 ? 'amber' : 'slate'}
          badge="Pending"
        />

        {/* 5. Cash in Hand */}
        <StatCard
          title="Cash in Hand"
          value={formatCurrency(dashboardStats.cashInHand)}
          subtitle="Physical cash in treasury"
          icon={Wallet}
          variant="slate"
        />

        {/* 6. Bank Balance */}
        <StatCard
          title="Bank Balance"
          value={formatCurrency(dashboardStats.bankBalance)}
          subtitle="Active bank account reserve"
          icon={Landmark}
          variant="slate"
        />

        {/* 7. UPI Balance */}
        <StatCard
          title="UPI Balance"
          value={formatCurrency(dashboardStats.upiBalance)}
          subtitle="Digital collection wallet"
          icon={Smartphone}
          variant="slate"
        />

        {/* 8. Total Transactions */}
        <StatCard
          title="Total Transactions"
          value={String(dashboardStats.totalTransactions)}
          subtitle="In selected time range"
          icon={Receipt}
          variant="slate"
        />
      </div>

      {/* 8 Additional Statistics Row */}
      <div className="p-4 rounded-xl bg-white border border-gray-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#1E3A5F]" />
          Period Statistics & Breakdown Highlights
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Today's Income</span>
            <span className="text-sm font-bold text-[#16A34A]">
              {formatCurrency(dashboardStats.todayIncome)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Today's Expenses</span>
            <span className="text-sm font-bold text-[#DC2626]">
              {formatCurrency(dashboardStats.todayExpenses)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">This Month Income</span>
            <span className="text-sm font-bold text-[#16A34A]">
              {formatCurrency(dashboardStats.thisMonthIncome)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">This Month Exp.</span>
            <span className="text-sm font-bold text-[#DC2626]">
              {formatCurrency(dashboardStats.thisMonthExpenses)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Total Donations</span>
            <span className="text-sm font-bold text-[#16A34A]">
              {formatCurrency(dashboardStats.totalDonations)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Sponsorships</span>
            <span className="text-sm font-bold text-[#16A34A]">
              {formatCurrency(dashboardStats.totalSponsorships)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Highest Exp. Cat</span>
            <span className="text-xs font-bold text-gray-800 truncate block" title={dashboardStats.highestExpenseCategory?.name || 'None'}>
              {dashboardStats.highestExpenseCategory?.name || 'None'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Unpaid Bills Count</span>
            <span className="text-sm font-bold text-[#DC2626]">
              {dashboardStats.totalUnpaidExpensesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
