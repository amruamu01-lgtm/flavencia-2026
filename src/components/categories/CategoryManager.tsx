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
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>Category Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-navy-50 text-[#1E3A5F] border border-navy-200">
              {categoryList.length} Categories
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage chart of accounts for festival receipts and expenditures
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white shadow-none transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Custom Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            Income Categories ({incomeCategories.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {incomeCategories.map(cat => (
              <div
                key={cat.categoryId}
                className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    {cat.categoryName}
                    <span className="text-[10px] font-mono text-gray-400">({cat.categoryId})</span>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{cat.description}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#16A34A]">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            Expense Categories ({expenseCategories.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {expenseCategories.map(cat => (
              <div
                key={cat.categoryId}
                className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    {cat.categoryName}
                    <span className="text-[10px] font-mono text-gray-400">({cat.categoryId})</span>
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{cat.description}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#16A34A]">
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
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category Type *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-semibold focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="EXPENSE">EXPENSE CATEGORY</option>
              <option value="INCOME">INCOME CATEGORY</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. VIP Hospitality / Merch Sales"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Accounting scope and purpose"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] resize-none focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
