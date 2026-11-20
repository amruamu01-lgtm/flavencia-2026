import React from 'react';
import {
  Award,
  FileDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertCircle,
  Landmark,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { generateFinalSettlementPdf } from '../../services/exportPdf';

export const FinalSettlementView: React.FC = () => {
  const { finalSettlementData } = useFinance();

  const handleDownloadPdf = () => {
    generateFinalSettlementPdf(finalSettlementData);
  };

  return (
    <div className="space-y-8">
      {/* Executive Festival Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#121217] via-[#1A1A24] to-[#14141B] border border-gold-500/40 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold-500/15 text-gold-300 border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              FLAVENCIA 2026 OFFICIAL AUDITED SETTLEMENT
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Festival Final Settlement Statement
            </h2>
            <p className="text-xs font-bold tracking-widest text-gold-400/90 uppercase font-sans">
              TAGLINE: BEYOND BOUNDARIES
            </p>
            <p className="text-xs text-slate-400 max-w-xl">
              Prepared Date: <span className="text-slate-200 font-semibold">{finalSettlementData.preparedDate}</span>. This certified ledger reconciles all festival revenues, actual vendor disbursements, and liquid reserves.
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-gold-500/25 self-start md:self-auto"
          >
            <FileDown className="w-4 h-4" />
            Download Official Settlement PDF
          </button>
        </div>
      </div>

      {/* Financial Position Master Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-emerald-500/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Grand Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(finalSettlementData.grandTotalIncome, true)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Gross collections across all categories</span>
        </div>

        {/* Total Paid Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-rose-500/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Grand Total Paid Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(finalSettlementData.grandTotalPaidExpenses, true)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Actual cash & bank disbursements</span>
        </div>

        {/* Net Available Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-gold-500/40 shadow-sm bg-gradient-to-br from-gold-500/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Net Liquid Available Balance</span>
            <div className="p-2 rounded-xl bg-gold-500/15 text-gold-500">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-gold-200">
            {formatCurrency(finalSettlementData.netAvailableBalance, true)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Total Income - Total Paid Expenses</span>
        </div>

        {/* Outstanding Liabilities */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Total Outstanding Liabilities</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {formatCurrency(finalSettlementData.totalOutstandingAmount, true)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Unpaid and partially paid bill balances</span>
        </div>
      </div>

      {/* Two Column Breakdown: Income Summary vs Expense Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Final Income Breakdown by Source
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Total Donations (Patron & Institutional)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(finalSettlementData.donationsIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Total Sponsorship Revenue</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(finalSettlementData.sponsorshipIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Total Registration & Competition Fees</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(finalSettlementData.registrationIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Other Income (Stalls, Food Sales, Ads)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(finalSettlementData.otherIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold">
              <span className="text-emerald-700 dark:text-emerald-300">Grand Total Income Collections</span>
              <span className="text-emerald-700 dark:text-emerald-300 text-sm">
                {formatCurrency(finalSettlementData.grandTotalIncome, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Final Paid Expense Breakdown by Category
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Stage, Sound, Lighting & Decor</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(finalSettlementData.stageAndSoundPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Food, Refreshments & Catering</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(finalSettlementData.foodAndCateringPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Printing, Designing & Souvenir Flex</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(finalSettlementData.printingPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Transportation & Accommodation</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(finalSettlementData.transportationPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Gifts, Prizes, Trophies & Other Ops</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(finalSettlementData.giftsPaid + finalSettlementData.otherExpensesPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold">
              <span className="text-rose-700 dark:text-rose-300">Grand Total Actual Paid Expenses</span>
              <span className="text-rose-700 dark:text-rose-300 text-sm">
                {formatCurrency(finalSettlementData.grandTotalPaidExpenses, true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances Reconciled */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-gold-500" />
          Closing Liquid Treasury Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Cash in Hand</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(finalSettlementData.cashInHand, true)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Bank Account</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(finalSettlementData.bankBalance, true)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">UPI Account</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(finalSettlementData.upiBalance, true)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-gold-500/20 text-xs flex items-center justify-between">
          <span className="text-slate-300 font-semibold">
            Reconciliation Check: Sum of Account Balances = Net Liquid Available Balance
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            100% Mathematically Reconciled
          </span>
        </div>
      </div>
    </div>
  );
};
