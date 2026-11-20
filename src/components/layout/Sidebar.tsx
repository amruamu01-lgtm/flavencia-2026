import React from 'react';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
  ReceiptText,
  PieChart,
  FileSpreadsheet,
  FolderKanban,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  Layers,
  History
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'payments'
  | 'accounts'
  | 'transactions'
  | 'budgets'
  | 'reports'
  | 'settlement'
  | 'categories'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income Management', icon: ArrowDownLeft },
    { id: 'expenses', label: 'Expense Management', icon: ArrowUpRight },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'accounts', label: 'Cash & Bank Accounts', icon: Landmark },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budget Management', icon: PieChart },
    { id: 'reports', label: 'Financial Reports', icon: FileSpreadsheet },
    { id: 'settlement', label: 'Final Settlement', icon: Award, highlight: true },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id as NavigationTab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white text-[#374151] border-r border-gray-200 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="font-extrabold text-white text-xl font-serif">F</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-wide text-[#1E3A5F] uppercase font-sans flex items-center gap-1">
                  FLAVENCIA <span className="text-gray-900 font-extrabold">2026</span>
                </span>
                <span className="text-[10px] tracking-widest text-gray-500 font-semibold uppercase">
                  BEYOND BOUNDARIES
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-[#1E3A5F] hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHighlight = item.highlight;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-[#F0F4F8] text-[#1E3A5F] font-bold'
                    : isHighlight
                    ? 'text-[#1E3A5F] hover:bg-[#F0F4F8] font-semibold'
                    : 'text-[#374151] hover:text-[#1E3A5F] hover:bg-gray-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'text-[#1E3A5F]'
                      : isHighlight
                      ? 'text-[#1E3A5F]'
                      : 'text-gray-500 group-hover:text-[#1E3A5F]'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left flex items-center justify-between">
                    {item.label}
                    {isHighlight && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-50 text-[#1E3A5F] font-bold">
                        Key
                      </span>
                    )}
                  </span>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#1E3A5F]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Status Box */}
        {!collapsed && (
          <div className="p-3 m-3 rounded-xl bg-[#F3F4F6] border border-gray-200 text-[11px]">
            <div className="flex items-center gap-2 text-[#1E3A5F] font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A5F]" />
              Direct Entry System
            </div>
            <p className="text-gray-600 leading-relaxed text-[10px]">
              Fast execution mode active. All approved income and expenses write directly to the master ledger.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
