import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { PaymentMethod } from '../../types/financial';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { categoryList, accountList, addExpense, submitting } = useFinance();

  const expenseCategories = categoryList.filter(c => c.categoryType === 'EXPENSE' && c.isActive);

  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.categoryId || 'CAT-EXP-01');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [accountId, setAccountId] = useState(accountList[0]?.accountId || 'ACC-01');
  const [paidBy, setPaidBy] = useState('Admin');
  const [billUrl, setBillUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Compute live preview of balance & status
  const numTotal = parseFloat(totalAmount) || 0;
  const numPaid = parseFloat(paidAmount) || 0;
  const previewBalance = Math.max(0, numTotal - numPaid);
  let previewStatus = 'UNPAID';
  if (numPaid >= numTotal && numTotal > 0) previewStatus = 'PAID';
  else if (numPaid > 0) previewStatus = 'PARTIALLY PAID';

  const handlePayFull = () => {
    setPaidAmount(totalAmount);
  };

  const handlePayZero = () => {
    setPaidAmount('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numTotal <= 0) {
      setError('Total expense bill amount must be greater than ₹0.');
      return;
    }
    if (numPaid < 0) {
      setError('Paid amount cannot be negative.');
      return;
    }
    if (numPaid > numTotal) {
      setError(`Paid amount (${formatCurrency(numPaid)}) cannot exceed total bill amount (${formatCurrency(numTotal)}).`);
      return;
    }
    if (numPaid > 0 && !accountId) {
      setError('Please select a payment account to disburse funds from.');
      return;
    }
    if (!itemName.trim()) {
      setError('Please specify the item or purpose.');
      return;
    }
    if (!vendorName.trim()) {
      setError('Please specify the vendor or payee name.');
      return;
    }

    const res = await addExpense({
      date,
      categoryId,
      itemName: itemName.trim(),
      description: description.trim(),
      vendorName: vendorName.trim(),
      totalAmount: numTotal,
      paidAmount: numPaid,
      paymentMethod,
      accountId: numPaid > 0 ? accountId : '',
      paidBy: paidBy.trim(),
      billUrl: billUrl.trim(),
      remarks: remarks.trim()
    });

    if (res.success) {
      setItemName('');
      setDescription('');
      setVendorName('');
      setTotalAmount('');
      setPaidAmount('');
      setBillUrl('');
      setRemarks('');
      onClose();
    } else {
      setError(res.error || 'Failed to record expense.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Festival Expense"
      subtitle="Direct expense booking – zero approval delay"
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Expense Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            >
              {expenseCategories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item & Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Item / Purpose *
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="e.g. Main Auditorium JBL Sound Rig"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Vendor / Paid To *
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              placeholder="e.g. Sonic Waves Sound Solutions"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Amounts (Total & Paid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Total Bill Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)}
              placeholder="10000"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actual Paid Amount (₹)
              </label>
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={handlePayZero}
                  className="text-[#DC2626] hover:underline font-semibold"
                >
                  Pay ₹0 (Unpaid)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-[#16A34A] hover:underline font-semibold"
                >
                  Pay Full
                </button>
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              placeholder="0 (or partial amount)"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#DC2626] font-bold focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Status & Balance Preview Box */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold">
              Computed Status
            </span>
            <span className={`font-bold ${
              previewStatus === 'PAID'
                ? 'text-[#16A34A]'
                : previewStatus === 'PARTIALLY PAID'
                ? 'text-amber-600'
                : 'text-[#DC2626]'
            }`}>
              {previewStatus}
            </span>
          </div>

          <div className="text-right">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">
              Outstanding Balance
            </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(previewBalance)}
            </span>
          </div>
        </div>

        {/* Account and Method (when paid > 0) */}
        {numPaid > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Disburse From Account *
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold focus:border-[#1E3A5F]"
              >
                {accountList.map(acc => (
                  <option key={acc.accountId} value={acc.accountId}>
                    {acc.accountName} (Balance: {formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Disbursement Method *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-[#1E3A5F]"
              >
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="CARD">CARD</option>
              </select>
            </div>
          </div>
        )}

        {/* Paid By & Bill URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Paid By / Handler
            </label>
            <input
              type="text"
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              placeholder="e.g. General Secretary"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Google Drive Bill URL
            </label>
            <input
              type="url"
              value={billUrl}
              onChange={e => setBillUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Description & Notes
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Contract terms, quotation reference, invoice number..."
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F] resize-none"
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
            {submitting ? 'Recording...' : 'Book Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
