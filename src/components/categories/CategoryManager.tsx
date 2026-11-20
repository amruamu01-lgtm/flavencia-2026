import React, { useState } from 'react';
import { FolderKanban, Plus, CheckCircle, Tag, Edit2, Trash2, Globe, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { CategoryRecord } from '../../types/financial';

export const CategoryManager: React.FC = () => {
  const { categoryList, addCategory, updateCategory, deleteCategory, submitting } = useFinance();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit / Rename Category State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);

  const incomeCategories = categoryList.filter(c => c.categoryType === 'INCOME');
  const expenseCategories = categoryList.filter(c => c.categoryType === 'EXPENSE');

  const handleSaveAdd = async (e: React.FormEvent) => {
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

  const handleOpenEdit = (cat: CategoryRecord) => {
    setEditingCatId(cat.categoryId);
    setEditName(cat.categoryName);
    setEditType(cat.categoryType);
    setEditDesc(cat.description || '');
    setEditActive(cat.isActive !== false);
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    if (!editName.trim()) {
      setEditError('Category name is required.');
      return;
    }
    const res = await updateCategory(editingCatId, editName.trim(), editType, editDesc.trim(), editActive);
    if (res.success) {
      setIsEditOpen(false);
    } else {
      setEditError(res.error || 'Failed to update category.');
    }
  };

  const handleDelete = async (cat: CategoryRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete category "${cat.categoryName}" (${cat.categoryId})?\n\nIf this category is linked to existing transactions, it will be safely deactivated to preserve historical accounting integrity.`
    );
    if (confirmed) {
      const res = await deleteCategory(cat.categoryId);
      if (!res.success) {
        alert(res.error || 'Failed to delete category.');
      }
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
            Manage chart of accounts for festival receipts and expenditures. Supports English & മലയാളം category names.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setDesc('');
            setError(null);
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white shadow-none transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Custom Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              Income Categories ({incomeCategories.length})
            </span>
            <span className="text-[11px] text-gray-400 font-normal">Customizable & Synced</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {incomeCategories.map(cat => (
              <div
                key={cat.categoryId}
                className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100 flex items-center justify-between gap-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span>{cat.categoryName}</span>
                    <span className="text-[10px] font-mono text-gray-400">({cat.categoryId})</span>
                    {!cat.isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 text-gray-600 font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    title="Edit / Rename Category"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1E3A5F] hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    title="Delete Category"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#DC2626] hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              Expense Categories ({expenseCategories.length})
            </span>
            <span className="text-[11px] text-gray-400 font-normal">Customizable & Synced</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {expenseCategories.map(cat => (
              <div
                key={cat.categoryId}
                className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100 flex items-center justify-between gap-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span>{cat.categoryName}</span>
                    <span className="text-[10px] font-mono text-gray-400">({cat.categoryId})</span>
                    {!cat.isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 text-gray-600 font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    title="Edit / Rename Category"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#1E3A5F] hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    title="Delete Category"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#DC2626] hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
        subtitle="Create an income or expense classification (Supports English & മലയാളം)"
        maxWidth="sm"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category Type *
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-semibold focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="EXPENSE">EXPENSE CATEGORY (ചെലവ്)</option>
              <option value="INCOME">INCOME CATEGORY (വരവ്)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category Name * (English or മലയാളം)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. VIP Hospitality / സ്റ്റേജ് & സൗണ്ട്"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Enter any standard or Malayalam name. Automatically synced to Google Sheets.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Description / വിവരണം
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

      {/* Edit / Rename Category Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit / Rename Category"
        subtitle="Update category title, classification, or active status"
        maxWidth="sm"
      >
        {editError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-medium">
            {editError}
          </div>
        )}

        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category ID
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={editingCatId}
              className="w-full text-xs px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category Type *
            </label>
            <select
              value={editType}
              onChange={e => setEditType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-semibold focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="EXPENSE">EXPENSE CATEGORY (ചെലവ്)</option>
              <option value="INCOME">INCOME CATEGORY (വരവ്)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Category Name * (Supports English & മലയാളം)
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="e.g. Stage and Sound / സ്റ്റേജ് & സൗണ്ട്"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Description / വിവരണം
            </label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Accounting purpose"
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] resize-none focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="categoryActiveCheckbox"
              checked={editActive}
              onChange={e => setEditActive(e.target.checked)}
              className="rounded text-[#1E3A5F] focus:ring-[#1E3A5F]"
            />
            <label htmlFor="categoryActiveCheckbox" className="text-xs text-gray-700 font-medium cursor-pointer">
              Active Category (Available in entry forms)
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : 'Update Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
