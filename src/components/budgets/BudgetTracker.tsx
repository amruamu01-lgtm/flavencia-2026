import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Trash2,
  Edit2
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const BudgetTracker: React.FC = () => {
  const { budgetList, expenseList, categoryList, saveBudget, deleteBudget, submitting } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categoryList.filter(c => c.categoryType === 'EXPENSE' && c.isActive);

  // Compute live budget status per item based on actual paid expenses
  const enrichedBudgets = budgetList.map(b => {
    const category = categoryList.find(c => c.categoryId === b.categoryId);
    const catName = category ? category.categoryName : b.categoryId;

    const actualPaid = expenseList
      .filter(e => e.categoryId === b.categoryId)
      .reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);

    const remaining = Math.max(0, b.budgetAmount - actualPaid);
    const utilization = b.budgetAmount > 0 ? (actualPaid / b.budgetAmount) * 100 : 0;

    let status: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL';
    if (utilization >= 100) status = 'EXCEEDED';
    else if (utilization >= 80) status = 'WARNING';

    return {
      ...b,
      categoryName: catName,
      spentAmount: actualPaid,
      remainingAmount: remaining,
      utilizationPercentage: utilization,
      status
    };
  });

  const totalBudgeted = enrichedBudgets.reduce((s, b) => s + b.budgetAmount, 0);
  const totalSpentAcrossBudgets = enrichedBudgets.reduce((s, b) => s + b.spentAmount, 0);

  const handleOpenAdd = () => {
    setEditingCategory(expenseCategories[0]?.categoryId || 'CAT-EXP-01');
    setBudgetAmount('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (categoryId: string, currentAmount: number) => {
    setEditingCategory(categoryId);
    setBudgetAmount(String(currentAmount));
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to remove this category budget?')) {
      await deleteBudget(budgetId);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(budgetAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid budget allocation amount greater than ₹0.');
      return;
    }
    const res = await saveBudget(editingCategory, numAmount);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      setError(res.error || 'Failed to save budget.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Budget Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-navy-50 text-[#1E3A5F] border border-navy-200">
              {enrichedBudgets.length} Targets
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Allocated Budget: <strong className="text-gray-900 font-bold">{formatCurrency(totalBudgeted)}</strong> • Actual
            Spent: <strong className="text-[#DC2626] font-bold">{formatCurrency(totalSpentAcrossBudgets)}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white shadow-none transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Set Category Budget
        </button>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrichedBudgets.map(b => {
          const isWarning = b.status === 'WARNING';
          const isExceeded = b.status === 'EXCEEDED';

          return (
            <div
              key={b.budgetId}
              className={`p-5 rounded-xl bg-white border shadow-none transition-all flex flex-col justify-between ${
                isExceeded
                  ? 'border-red-300'
                  : isWarning
                  ? 'border-amber-300'
                  : 'border-gray-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {b.categoryName}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {b.period || 'FLAVENCIA 2026'}
                    </span>
                  </div>
                  <Badge type="budget" value={b.status} />
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Budget Target</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(b.budgetAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Actual Paid</span>
                    <span className="font-bold text-[#DC2626]">
                      {formatCurrency(b.spentAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Remaining</span>
                    <span className={`font-bold ${b.spentAmount > b.budgetAmount ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                      {b.spentAmount > b.budgetAmount ? `-${formatCurrency(b.spentAmount - b.budgetAmount)}` : formatCurrency(b.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-gray-500">Utilization</span>
                    <span className={isExceeded ? 'text-[#DC2626]' : isWarning ? 'text-amber-600' : 'text-gray-700'}>
                      {b.utilizationPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-[#DC2626]'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-[#16A34A]'
                      }`}
                      style={{ width: `${Math.min(100, b.utilizationPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Warning Alerts */}
                {isExceeded && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-[#DC2626] font-medium flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Over budget by {formatCurrency(b.spentAmount - b.budgetAmount)}!</span>
                  </div>
                )}
                {isWarning && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Budget reached 80% ceiling limit.</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-3 text-xs">
                <button
                  onClick={() => handleEdit(b.categoryId, b.budgetAmount)}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-[#1E3A5F]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.budgetId)}
                  className="inline-flex items-center gap-1 text-[#DC2626] hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {enrichedBudgets.length === 0 && (
        <div className="p-12 text-center rounded-xl bg-white border border-gray-200">
          <PieIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-bold text-gray-900">No category budgets defined</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Set budget ceilings for categories like Stage & Sound, Food, Printing, and Gifts to track overspending warnings.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Set First Budget
          </button>
        </div>
      )}

      {/* Set/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Expense Category Budget"
        subtitle="Establish financial spending limit for FLAVENCIA 2026"
        maxWidth="sm"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Expense Category *
            </label>
            <select
              value={editingCategory}
              onChange={e => setEditingCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            >
              {expenseCategories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Budget Allocation (₹ INR) *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              required
              value={budgetAmount}
              onChange={e => setBudgetAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-bold focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
