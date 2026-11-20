import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { ExpenseRecord, PaymentMethod } from '../../types/financial';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetExpense?: ExpenseRecord | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  targetExpense
}) => {
  const { expenseList, accountList, recordPayment, submitting } = useFinance();

  const [selectedExpenseId, setSelectedExpenseId] = useState(targetExpense?.expenseId || '');
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [accountId, setAccountId] = useState(accountList[0]?.accountId || 'ACC-01');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetExpense) {
      setSelectedExpenseId(targetExpense.expenseId);
      setAmount(String(targetExpense.balanceAmount || ''));
    }
  }, [targetExpense]);

  // Current active expense record
  const currentExpense = expenseList.find(e => e.expenseId === selectedExpenseId);
  const eligibleExpenses = expenseList.filter(e => e.paymentStatus !== 'PAID');

  const handlePayFullOutstanding = () => {
    if (currentExpense) {
      setAmount(String(currentExpense.balanceAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedExpenseId) {
      setError('Please select an expense to record payment for.');
      return;
    }
    if (!currentExpense) {
      setError('Selected expense record not found.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Payment amount must be greater than ₹0.');
      return;
    }
    if (numAmount > currentExpense.balanceAmount) {
      setError(
        `Payment amount (${formatCurrency(numAmount)}) cannot exceed the outstanding balance of ${formatCurrency(
          currentExpense.balanceAmount
        )}.`
      );
      return;
    }
    if (!accountId) {
      setError('Please select the payment account.');
      return;
    }

    const res = await recordPayment(
      selectedExpenseId,
      numAmount,
      accountId,
      paymentMethod,
      paymentDate,
      referenceNumber.trim(),
      remarks.trim()
    );

    if (res.success) {
      setAmount('');
      setReferenceNumber('');
      setRemarks('');
      onClose();
    } else {
      setError(res.error || 'Failed to record payment.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Expense Payment"
      subtitle="Disburse full or partial payment against vendor invoice"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Expense */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Select Pending Expense *
          </label>
          <select
            value={selectedExpenseId}
            onChange={e => {
              setSelectedExpenseId(e.target.value);
              const exp = expenseList.find(x => x.expenseId === e.target.value);
              if (exp) setAmount(String(exp.balanceAmount));
            }}
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold focus:bg-white focus:border-[#1E3A5F]"
          >
            <option value="">-- Choose an outstanding bill --</option>
            {eligibleExpenses.map(exp => (
              <option key={exp.expenseId} value={exp.expenseId}>
                {exp.itemName} ({exp.vendorName}) - Bal: {formatCurrency(exp.balanceAmount)}
              </option>
            ))}
          </select>
        </div>

        {/* Expense Summary Box */}
        {currentExpense && (
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Invoice:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(currentExpense.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Already Paid:</span>
              <span className="font-semibold text-[#16A34A]">{formatCurrency(currentExpense.paidAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold">
              <span className="text-[#DC2626]">Remaining Balance:</span>
              <span className="text-[#DC2626]">{formatCurrency(currentExpense.balanceAmount)}</span>
            </div>
          </div>
        )}

        {/* Payment Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Payment Amount (₹) *
            </label>
            {currentExpense && (
              <button
                type="button"
                onClick={handlePayFullOutstanding}
                className="text-[10px] text-[#1E3A5F] hover:underline font-semibold"
              >
                Pay Full Balance ({formatCurrency(currentExpense.balanceAmount)})
              </button>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter payment amount"
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#DC2626] font-bold focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>

        {/* Date & Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Payment Account *
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
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

        {/* Method & Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            >
              <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS/IMPS)</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">CHEQUE</option>
              <option value="CARD">CARD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              UTR / Cheque Ref No.
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR1298491823"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Payment Remarks / Voucher Notes
          </label>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="e.g. 2nd advance payment against bill"
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
          />
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
            {submitting ? 'Recording...' : 'Disburse & Update Ledger'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
