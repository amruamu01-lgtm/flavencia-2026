import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { PaymentMethod } from '../../types/financial';
import { getTodayDateString } from '../../utils/formatters';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ isOpen, onClose }) => {
  const { categoryList, accountList, addIncome, submitting } = useFinance();

  const incomeCategories = categoryList.filter(c => c.categoryType === 'INCOME' && c.isActive);

  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState(incomeCategories[0]?.categoryId || 'CAT-INC-01');
  const [sourceName, setSourceName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [accountId, setAccountId] = useState(accountList[0]?.accountId || 'ACC-01');
  const [receivedBy, setReceivedBy] = useState('Admin');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (!sourceName.trim()) {
      setError('Please specify who the income was received from.');
      return;
    }
    if (!accountId) {
      setError('Please select the receiving account.');
      return;
    }

    const res = await addIncome({
      date,
      categoryId,
      sourceName: sourceName.trim(),
      description: description.trim(),
      amount: numAmount,
      paymentMethod,
      accountId,
      receivedBy: receivedBy.trim(),
      referenceNumber: referenceNumber.trim(),
      receiptUrl: receiptUrl.trim(),
      remarks: remarks.trim()
    });

    if (res.success) {
      // Reset form
      setSourceName('');
      setDescription('');
      setAmount('');
      setReferenceNumber('');
      setReceiptUrl('');
      setRemarks('');
      onClose();
    } else {
      setError(res.error || 'Failed to save income record.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Festival Income"
      subtitle="Direct credit entry to master spreadsheet & ledger"
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
              Income Date *
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
              {incomeCategories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Source Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Received From / Source *
          </label>
          <input
            type="text"
            required
            value={sourceName}
            onChange={e => setSourceName(e.target.value)}
            placeholder="e.g. John Doe / Tata Consultancy / Stall 4"
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>

        {/* Amount & Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Amount (₹ INR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="50000"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#16A34A] font-bold focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Deposit Account *
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold focus:bg-white focus:border-[#1E3A5F]"
            >
              {accountList.map(acc => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.accountName} ({acc.accountType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Method & Received By */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            >
              <option value="CASH">CASH</option>
              <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI / QR CODE</option>
              <option value="CHEQUE">CHEQUE</option>
              <option value="CARD">CARD</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Received By
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={e => setReceivedBy(e.target.value)}
              placeholder="e.g. Finance Coordinator"
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Reference Number & Receipt URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Reference / Txn / UTR No.
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              placeholder="UTR or Cheque / Cash Receipt No."
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Google Drive Receipt URL
            </label>
            <input
              type="url"
              value={receiptUrl}
              onChange={e => setReceiptUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
            />
          </div>
        </div>

        {/* Description & Remarks */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Description / Purpose
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Title Sponsorship 1st installment"
            className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Internal Remarks
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Additional notes for accounting audit"
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
            {submitting ? 'Saving...' : 'Record & Credit Income'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
