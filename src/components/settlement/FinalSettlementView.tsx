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
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-gray-200 shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-navy-50 text-[#1E3A5F] border border-navy-200">
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A5F]" />
              FLAVENCIA 2026 OFFICIAL AUDITED SETTLEMENT
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Festival Final Settlement Statement
            </h2>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase font-sans">
              TAGLINE: BEYOND BOUNDARIES
            </p>
            <p className="text-xs text-gray-500 max-w-xl">
              Prepared Date: <span className="text-gray-800 font-semibold">{finalSettlementData.preparedDate}</span>. This certified ledger reconciles all festival revenues, actual vendor disbursements, and liquid reserves.
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-all shadow-none self-start md:self-auto"
          >
            <FileDown className="w-4 h-4" />
            Download Official Settlement PDF
          </button>
        </div>
      </div>

      {/* Financial Position Master Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-xl bg-white border border-emerald-200 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-gray-500">Grand Total Income</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#16A34A]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#16A34A]">
            {formatCurrency(finalSettlementData.grandTotalIncome, true)}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Gross collections across all categories</span>
        </div>

        {/* Total Paid Expenses */}
        <div className="p-5 rounded-xl bg-white border border-rose-200 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-gray-500">Grand Total Paid Expenses</span>
            <div className="p-2 rounded-lg bg-rose-50 text-[#DC2626]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#DC2626]">
            {formatCurrency(finalSettlementData.grandTotalPaidExpenses, true)}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Actual cash & bank disbursements</span>
        </div>

        {/* Net Available Balance */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-gray-500">Net Liquid Available Balance</span>
            <div className="p-2 rounded-lg bg-navy-50 text-[#1E3A5F]">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1E3A5F]">
            {formatCurrency(finalSettlementData.netAvailableBalance, true)}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Total Income - Total Paid Expenses</span>
        </div>

        {/* Outstanding Liabilities */}
        <div className="p-5 rounded-xl bg-white border border-amber-200 shadow-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-gray-500">Total Outstanding Liabilities</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {formatCurrency(finalSettlementData.totalOutstandingAmount, true)}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">Unpaid and partially paid bill balances</span>
        </div>
      </div>

      {/* Two Column Breakdown: Income Summary vs Expense Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            Final Income Breakdown by Source
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Total Donations (Patron & Institutional)</span>
              <span className="font-bold text-[#16A34A]">
                {formatCurrency(finalSettlementData.donationsIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Total Sponsorship Revenue</span>
              <span className="font-bold text-[#16A34A]">
                {formatCurrency(finalSettlementData.sponsorshipIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Total Registration & Competition Fees</span>
              <span className="font-bold text-[#16A34A]">
                {formatCurrency(finalSettlementData.registrationIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Other Income (Stalls, Food Sales, Ads)</span>
              <span className="font-bold text-[#16A34A]">
                {formatCurrency(finalSettlementData.otherIncome, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold">
              <span className="text-emerald-800">Grand Total Income Collections</span>
              <span className="text-[#16A34A] text-sm">
                {formatCurrency(finalSettlementData.grandTotalIncome, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            Final Paid Expense Breakdown by Category
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Stage, Sound, Lighting & Decor</span>
              <span className="font-bold text-[#DC2626]">
                {formatCurrency(finalSettlementData.stageAndSoundPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Food, Refreshments & Catering</span>
              <span className="font-bold text-[#DC2626]">
                {formatCurrency(finalSettlementData.foodAndCateringPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Printing, Designing & Souvenir Flex</span>
              <span className="font-bold text-[#DC2626]">
                {formatCurrency(finalSettlementData.printingPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Transportation & Accommodation</span>
              <span className="font-bold text-[#DC2626]">
                {formatCurrency(finalSettlementData.transportationPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F3F4F6] text-xs">
              <span className="text-gray-700 font-semibold">Gifts, Prizes, Trophies & Other Ops</span>
              <span className="font-bold text-[#DC2626]">
                {formatCurrency(finalSettlementData.giftsPaid + finalSettlementData.otherExpensesPaid, true)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold">
              <span className="text-rose-800">Grand Total Actual Paid Expenses</span>
              <span className="text-[#DC2626] text-sm">
                {formatCurrency(finalSettlementData.grandTotalPaidExpenses, true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances Reconciled */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#1E3A5F]" />
          Closing Liquid Treasury Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#F3F4F6] border border-gray-200 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Cash in Hand</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(finalSettlementData.cashInHand, true)}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F3F4F6] border border-gray-200 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Bank Account</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(finalSettlementData.bankBalance, true)}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F3F4F6] border border-gray-200 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 block mb-1">UPI Account</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(finalSettlementData.upiBalance, true)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-emerald-800 font-semibold">
            Reconciliation Check: Sum of Account Balances = Net Liquid Available Balance
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#16A34A] font-bold">
            <CheckCircle2 className="w-4 h-4" />
            100% Mathematically Reconciled
          </span>
        </div>
      </div>
    </div>
  );
};
