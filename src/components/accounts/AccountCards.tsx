import React, { useState } from 'react';
import {
  Landmark,
  Wallet,
  Smartphone,
  ArrowRightLeft,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransferModal } from './TransferModal';
import { AddAccountModal } from './AddAccountModal';

export const AccountCards: React.FC = () => {
  const { accountList, transferList } = useFinance();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [defaultSourceAccount, setDefaultSourceAccount] = useState<string | undefined>();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return Wallet;
      case 'UPI':
        return Smartphone;
      default:
        return Landmark;
    }
  };

  const handleQuickTransfer = (accId: string) => {
    setDefaultSourceAccount(accId);
    setIsTransferOpen(true);
  };

  const totalLiquidSurplus = accountList.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Cash & Bank Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
              {accountList.length} Active Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total Combined Liquid Funds:{' '}
            <strong className="text-gold-500 font-bold">{formatCurrency(totalLiquidSurplus)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#15151C] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1D1D26] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-gold-500" />
            Add Account
          </button>

          <button
            onClick={() => {
              setDefaultSourceAccount(undefined);
              setIsTransferOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-gold-500/20 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer Funds
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {accountList.map(acc => {
          const Icon = getAccountIcon(acc.accountType);
          const currentBal = acc.currentBalance || 0;
          const isNegative = currentBal < 0;

          return (
            <div
              key={acc.accountId}
              className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-gold-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-500 dark:text-gold-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {acc.accountName}
                      </h3>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                        {acc.accountType} ACCOUNT
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {acc.accountId}
                  </span>
                </div>

                {/* Big Balance */}
                <div className="my-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Current Balance
                  </span>
                  <div
                    className={`text-2xl font-extrabold tracking-tight ${
                      isNegative
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-gold-200'
                    }`}
                  >
                    {formatCurrency(currentBal)}
                  </div>
                </div>

                {/* Sub-Metrics: Opening, Credits, Debits */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Opening</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(acc.openingBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Credits (+)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(acc.totalCredits || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Debits (-)</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(acc.totalDebits || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Active Liquid Asset
                </span>
                <button
                  onClick={() => handleQuickTransfer(acc.accountId)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-gold-500 hover:text-gold-400 hover:underline"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Transfer From
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inter-Account Transfer History */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-gold-500" />
              Inter-Account Transfer History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of all funds transferred between cash, bank, and UPI
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transferList.length} transfers
          </span>
        </div>

        {transferList.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No inter-account transfers executed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Transfer ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">From Account</th>
                  <th className="py-2.5 px-3">To Account</th>
                  <th className="py-2.5 px-3">Ref No.</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transferList.map(t => {
                  const from = accountList.find(a => a.accountId === t.fromAccountId)?.accountName || t.fromAccountId;
                  const to = accountList.find(a => a.accountId === t.toAccountId)?.accountName || t.toAccountId;
                  return (
                    <tr key={t.transferId} className="hover:bg-slate-50/50 dark:hover:bg-[#171720]">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{t.transferId}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{formatDate(t.transferDate)}</td>
                      <td className="py-2.5 px-3 text-rose-500 font-semibold">{from}</td>
                      <td className="py-2.5 px-3 text-emerald-500 font-semibold">{to}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.referenceNumber || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{t.description}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransferModal
        isOpen={isTransferOpen}
        defaultFromAccountId={defaultSourceAccount}
        onClose={() => setIsTransferOpen(false)}
      />
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
    </div>
  );
};
