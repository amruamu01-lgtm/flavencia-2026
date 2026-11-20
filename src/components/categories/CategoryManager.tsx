import React, { useState } from 'react';
import { FolderKanban, Plus, CheckCircle, Tag } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';

export const CategoryManager: React.FC = () => {
  const { categoryList, addCategory, submitting } = useFinance();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState<string | null>(null);

  const incomeCategories = categoryList.filter(c => c.categoryType === 'INCOME');
  const expenseCategories = categoryList.filter(c => c.categoryType === 'EXPENSE');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    const res = await addCategory(name.trim(), type, desc.trim());
    if (res.success) {
      setName('');
      setDesc('');
      setIsAddOpen(false);
    } else {
      setError(res.error || 'Failed to add category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Category Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
              {categoryList.length} Categories
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage chart of accounts for festival receipts and expenditures
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-gold-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Custom Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Income Categories ({incomeCategories.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {incomeCategories.map(cat => (
              <div
                key={cat.categoryId}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {cat.categoryName}
                    <span className="text-[10px] font-mono text-slate-400">({cat.categoryId})</span>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Expense Categories ({expenseCategories.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {expenseCategories.map(cat => (
              <div
                key={cat.categoryId}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {cat.categoryName}
                    <span className="text-[10px] font-mono text-slate-400">({cat.categoryId})</span>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Category"
        subtitle="Create an income or expense classification"
        maxWidth="sm"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Category Type *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-100 font-semibold"
            >
              <option value="EXPENSE">EXPENSE CATEGORY</option>
              <option value="INCOME">INCOME CATEGORY</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. VIP Hospitality / Merch Sales"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Accounting scope and purpose"
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-100 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-gold-500 hover:bg-gold-600 text-slate-950 rounded-xl"
            >
              {submitting ? 'Saving...' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
