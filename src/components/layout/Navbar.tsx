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
  const { dateFilter, setDateFilter, refreshData, loading, isBackendConnected } = useFinance();
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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0E0E13]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Active Section Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {activeTabTitle}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                FLAVENCIA 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#1A1A22] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-gold-500/40 transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              <span className="max-w-[120px] truncate">{dateFilter.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#14141A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Select Filter Range
                </div>
                {filterOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectFilter(opt)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateFilter.key === opt.key
                        ? 'bg-gold-500/15 text-gold-600 dark:text-gold-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                {/* Custom Date Range Picker */}
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 px-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Custom Dates</div>
                  <div className="space-y-1.5">
                    <input
                      type="date"
                      value={customStart}
                      onChange={e => setCustomStart(e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-200"
                    />
                    <input
                      type="date"
                      value={customEnd}
                      onChange={e => setCustomEnd(e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-200"
                    />
                    <button
                      onClick={handleApplyCustom}
                      className="w-full py-1 text-xs font-bold rounded bg-gold-500 hover:bg-gold-600 text-slate-950 transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sync / Refresh Button */}
          <button
            onClick={() => refreshData()}
            disabled={loading}
            title="Refresh database records"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-500' : ''}`} />
          </button>

          {/* Database Connection Pill */}
          <div
            title={isBackendConnected ? 'Connected to Google Sheets Web App' : 'Operating in Standalone Database Engine'}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gold-400'
              }`}
            />
            <span className="text-slate-700 dark:text-slate-300">
              {isBackendConnected ? 'Google Sheets' : 'Local Master DB'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Admin User Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                {adminUsername}
              </span>
              <span className="text-[10px] text-slate-400">Single Admin</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
