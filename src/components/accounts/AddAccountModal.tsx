import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { AccountType } from '../../types/financial';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, submitting } = useFinance();
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('BANK');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accountName.trim()) {
      setError('Account name is required.');
      return;
    }

    const numOpening = parseFloat(openingBalance) || 0;
    const res = await addAccount(accountName.trim(), accountType, numOpening);
    if (res.success) {
      setAccountName('');
      setOpeningBalance('0');
      onClose();
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Financial Account"
      subtitle="Register an additional cash counter, bank branch or payment gateway"
      maxWidth="sm"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Account Name *
          </label>
          <input
            type="text"
            required
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="e.g. SBI Main Festival Account / Counter 2"
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Account Type *
          </label>
          <select
            value={accountType}
            onChange={e => setAccountType(e.target.value as AccountType)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="BANK">BANK ACCOUNT</option>
            <option value="CASH">CASH IN HAND</option>
            <option value="UPI">UPI / WALLET</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Opening Balance (₹ INR)
          </label>
          <input
            type="number"
            step="0.01"
            value={openingBalance}
            onChange={e => setOpeningBalance(e.target.value)}
            placeholder="0"
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-600 text-slate-950"
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
