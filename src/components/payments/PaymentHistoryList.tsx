import React, { useState } from 'react';
import { CreditCard, Search, Plus, FileDown, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { RecordPaymentModal } from './RecordPaymentModal';

export const PaymentHistoryList: React.FC = () => {
  const { paymentList, expenseList, accountList } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  // Map expense details
  const enrichedPayments = paymentList.map(pay => {
    const expense = expenseList.find(e => e.expenseId === pay.expenseId);
    const account = accountList.find(a => a.accountId === pay.accountId);
    return {
      ...pay,
      itemName: expense?.itemName || 'Expense Bill',
      vendorName: expense?.vendorName || 'Vendor',
      accountName: account?.accountName || pay.accountId,
      totalExpenseBill: expense?.totalAmount || 0,
      currentExpenseStatus: expense?.paymentStatus || 'PAID'
    };
  });

  const displayPayments = enrichedPayments.filter(p => {
    return (
      p.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.remarks.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalDisbursed = displayPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Payment Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-navy-50 text-[#1E3A5F] border border-navy-200">
              {displayPayments.length} Disbursements
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Actual Cash & Bank Outflow:{' '}
            <strong className="text-[#DC2626] font-bold">{formatCurrency(totalDisbursed)}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsRecordOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A5F] hover:bg-[#172E4D] text-white shadow-none transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record New Payment
        </button>
      </div>

      {/* Multi-Payment Concept Explainer Card */}
      <div className="p-4 rounded-xl bg-[#F3F4F6] border border-gray-200 text-xs">
        <div className="flex items-center gap-2 text-[#1E3A5F] font-bold mb-1">
          <CheckCircle2 className="w-4 h-4 text-[#1E3A5F]" />
          Multi-Payment Tracking Protocol
        </div>
        <p className="text-gray-600 leading-relaxed text-[11px]">
          Vendors can be paid across multiple installments (e.g. ₹4,000 + ₹3,000 + ₹3,000 = ₹10,000). Every payment
          generates a unique Payment ID, a debit transaction in the ledger, and decreases the specific bank or cash
          account balance. Unpaid bill balances do not reduce account balances until payment is recorded.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-none">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search payment ID, expense ID, vendor, reference number, remarks..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#1E3A5F]"
          />
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-none overflow-hidden">
        {displayPayments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-600">
              No payment transactions recorded yet.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Payments are logged automatically when expenses are paid upfront or through installment vouchers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Ref</th>
                  <th className="py-3 px-4">Paid To / Item</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Method / Ref</th>
                  <th className="py-3 px-4 text-right">Disbursed Amount</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {displayPayments.map(p => (
                  <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {p.paymentId}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#1E3A5F]">
                      {p.expenseId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{p.itemName}</div>
                      <div className="text-[11px] text-gray-500">{p.vendorName}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-semibold">
                      {p.accountName}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      <div>{p.paymentMethod}</div>
                      {p.referenceNumber && (
                        <div className="text-[10px] font-mono text-gray-400">UTR: {p.referenceNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#DC2626] text-sm">
                      -{formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate" title={p.remarks}>
                      {p.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} />
    </div>
  );
};
