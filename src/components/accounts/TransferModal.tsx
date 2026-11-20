import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromAccountId
}) => {
  const { accountList, transferFunds, submitting } = useFinance();

  const [transferDate, setTransferDate] = useState(getTodayDateString());
  const [fromAccountId, setFromAccountId] = useState(defaultFromAccountId || accountList[0]?.accountId || 'ACC-01');
  const [toAccountId, setToAccountId] = useState(accountList[1]?.accountId || 'ACC-02');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fromAcc = accountList.find(a => a.accountId === fromAccountId);
  const toAcc = accountList.find(a => a.accountId === toAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid transfer amount greater than ₹0.');
      return;
    }
    if (fromAccountId === toAccountId) {
      setError('Source account and destination account cannot be the same.');
      return;
    }

    const res = await transferFunds(
      fromAccountId,
      toAccountId,
      numAmount,
      transferDate,
      referenceNumber.trim(),
      description.trim() || `Inter-account transfer from ${fromAcc?.accountName} to ${toAcc?.accountName}`
    );

    if (res.success) {
      setAmount('');
      setReferenceNumber('');
      setDescription('');
      onClose();
    } else {
      setError(res.error || 'Failed to complete account transfer.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inter-Account Transfer"
      subtitle="Shift funds between Cash, Bank, and UPI without affecting income/expenses"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
          {error}
        </div>
      )}

      {/* Accounting Notice */}
      <div className="mb-4 p-3 rounded-xl bg-navy-50 border border-navy-200 text-xs text-gray-700 flex items-start gap-2">
        <ArrowRightLeft className="w-4 h-4 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-[#1E3A5F]">Strict Accounting Law:</strong> Account transfers adjust liquid balances between accounts but are strictly excluded from Festival Income and Expenses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Transfer Date *
          </label>
          <input
            type="date"
            required
            value={transferDate}
            onChange={e => setTransferDate(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>

        {/* From & To Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Source Account (Deduct) *
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold focus:bg-white focus:border-[#1E3A5F]"
            >
              {accountList.map(acc => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.accountName} ({formatCurrency(acc.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Destination Account (Credit) *
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold focus:bg-white focus:border-[#1E3A5F]"
            >
              {accountList.map(acc => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.accountName} ({formatCurrency(acc.currentBalance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Transfer Amount (₹ INR) *
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#1E3A5F] font-bold focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>

        {/* Reference & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Reference / Challan No.
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              placeholder="Bank deposit slip / UTR"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Purpose / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Cash collected banked for security"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E3A5F] hover:bg-[#172E4D] text-white shadow-none transition-all"
          >
            {submitting ? 'Transferring...' : 'Execute Account Transfer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
