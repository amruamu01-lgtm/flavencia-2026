import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Smartphone,
  AlertCircle,
  Receipt,
  Scale
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
    </div>
  );
};
