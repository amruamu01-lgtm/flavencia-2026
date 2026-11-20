import React, { useState } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Database,
  RefreshCw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { DateFilterOption } from '../../types/financial';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTabTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTabTitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { adminUsername, logout } = useAuth();
  const {
    dateFilter,
    setDateFilter,
    refreshData,
    loading,
    isBackendConnected,
    lastSyncedAt,
    syncError,
    isSyncing
  } = useFinance();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filterOptions: { key: DateFilterOption['key']; label: string }[] = [
    { key: 'ALL_TIME', label: 'All Time' },
    { key: 'TODAY', label: 'Today' },
    { key: 'YESTERDAY', label: 'Yesterday' },
    { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'PREVIOUS_MONTH', label: 'Previous Month' },
    { key: 'CUSTOM', label: 'Custom Range' },
  ];

  const handleSelectFilter = (opt: { key: DateFilterOption['key']; label: string }) => {
    if (opt.key === 'CUSTOM') {
      setShowFilterDropdown(true);
    } else {
      setDateFilter({ key: opt.key, label: opt.label });
      setShowFilterDropdown(false);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      setDateFilter({
        key: 'CUSTOM',
        label: `${customStart} to ${customEnd}`,
        startDate: customStart,
        endDate: customEnd
      });
      setShowFilterDropdown(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Active Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                {activeTabTitle}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-navy-50 text-[#1E3A5F] border border-navy-200">
                FLAVENCIA 2026
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              BEYOND BOUNDARIES • Master Financial Controller
            </p>
          </div>
        </div>

        {/* Right: Date Filter, Connection Pill, Theme, Admin Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all shadow-none"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <span className="max-w-[120px] truncate">{dateFilter.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl p-2 z-50">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
                  Select Filter Range
                </div>
                {filterOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectFilter(opt)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateFilter.key === opt.key
                        ? 'bg-navy-50 text-[#1E3A5F] font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                {/* Custom Date Range Picker */}
                <div className="mt-2 pt-2 border-t border-gray-200 px-2">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Custom Dates</div>
                  <div className="space-y-1.5">
                    <input
                      type="date"
                      value={customStart}
                      onChange={e => setCustomStart(e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-800"
                    />
                    <input
                      type="date"
                      value={customEnd}
                      onChange={e => setCustomEnd(e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-800"
                    />
                    <button
                      onClick={handleApplyCustom}
                      className="w-full py-1 text-xs font-bold rounded bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Device Sync / Refresh Button */}
          <button
            onClick={() => refreshData()}
            disabled={isSyncing}
            title={lastSyncedAt ? `Last synced at ${lastSyncedAt.toLocaleTimeString()}. Click to refresh.` : 'Sync with Central Google Sheets Database'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#1E3A5F]' : 'text-gray-500'}`} />
            <span className="hidden xl:inline text-[11px]">
              {isSyncing ? 'Syncing...' : lastSyncedAt ? `Synced ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Sync'}
            </span>
          </button>

          {/* Database Central Sync Status Pill */}
          <div
            title={
              syncError
                ? `Sync issue: ${syncError}`
                : isBackendConnected
                ? 'Central Google Sheets Database Connected – All Devices Synchronized'
                : 'Central Google Sheets Not Configured – Enter Web App URL in Settings'
            }
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              syncError
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : isBackendConnected
                ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncError
                  ? 'bg-amber-500'
                  : isBackendConnected
                  ? 'bg-[#16A34A] animate-pulse'
                  : 'bg-gray-400'
              }`}
            />
            <span>
              {syncError ? 'Sync Issue' : isBackendConnected ? 'Google Sheets (Live)' : 'Setup Backend'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#1E3A5F]" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>

          {/* Admin User Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A5F]" />
                {adminUsername}
              </span>
              <span className="text-[10px] text-gray-500">Single Admin</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
