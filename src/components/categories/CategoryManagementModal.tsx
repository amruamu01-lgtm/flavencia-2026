import React, { useState } from 'react';
import { Tag, Plus, CheckCircle, Edit2, Trash2, Globe, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { CategoryRecord } from '../../types/financial';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: 'INCOME' | 'EXPENSE';
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  categoryType
}) => {
  const { categoryList, addCategory, updateCategory, deleteCategory, submitting } = useFinance();

  // New Category State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit / Rename Category State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);

  const categories = categoryList.filter(c => c.categoryType === categoryType);
  const typeLabel = categoryType === 'INCOME' ? 'Income' : 'Expense';

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    const res = await addCategory(name.trim(), categoryType, desc.trim());
    if (res.success) {
      setName('');
      setDesc('');
    } else {
      setError(res.error || 'Failed to add category.');
    }
  };

  const handleOpenEdit = (cat: CategoryRecord) => {
    setEditingCatId(cat.categoryId);
    setEditName(cat.categoryName);
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
    const res = await updateCategory(editingCatId, editName.trim(), categoryType, editDesc.trim(), editActive);
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage ${typeLabel} Categories`}
        subtitle={`Add, rename, edit, or delete ${typeLabel.toLowerCase()} categories. Supports English & മലയാളം.`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Quick Add Form */}
          <form onSubmit={handleSaveAdd} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#1E3A5F]" />
                Add New {typeLabel} Category
              </span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                English & മലയാളം
              </span>
            </div>

            {error && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={`Category Name (e.g. ${categoryType === 'INCOME' ? 'Sponsorship / സംഭാവനകൾ' : 'Stage & Sound / സ്റ്റേജ്'})`}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Optional brief description"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {submitting ? 'Adding...' : `Add Category`}
              </button>
            </div>
          </form>

          {/* Existing Categories Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                Available {typeLabel} Categories ({categories.length})
              </span>
              <span className="text-[11px] text-gray-400">
                Synchronized with central database
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No categories defined yet for {typeLabel.toLowerCase()}.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Category Name</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <tr key={cat.categoryId} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-[#1E3A5F]" />
                            <span>{cat.categoryName}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block">
                            {cat.categoryId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 max-w-xs truncate">
                          {cat.description || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              cat.isActive !== false
                                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {cat.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit / Rename Category"
                              className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1E3A5F] transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat)}
                              title="Delete / Deactivate Category"
                              className="p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-[#DC2626] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit / Rename ${typeLabel} Category`}
        subtitle={`Update category name or status. Changes propagate to all ${typeLabel.toLowerCase()} entries.`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#DC2626] text-xs">
              {editError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Category Name * (English & മലയാളം)
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Category Name"
              className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Description"
              className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editActiveCheckbox"
              checked={editActive}
              onChange={e => setEditActive(e.target.checked)}
              className="rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
            />
            <label htmlFor="editActiveCheckbox" className="text-xs text-gray-700 font-medium cursor-pointer">
              Active (Visible in dropdowns and new entries)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
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
    </>
  );
};
