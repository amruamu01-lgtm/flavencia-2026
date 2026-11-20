import React, { useState } from 'react';
import {
  Sliders,
  Database,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  ExternalLink,
  Smartphone,
  Laptop,
  HardDrive,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getGasBackendUrl,
  setGasBackendUrl,
  callBackendApi,
  loadLocalDb,
  saveLocalDb
} from '../../services/api';
import {
  getLocalStorageMigrationStatus,
  migrateLocalStorageToGoogleSheets,
  MigrationSummary
} from '../../services/migration';
import { formatCurrency } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    refreshData,
    isBackendConnected,
    lastSyncedAt,
    syncError,
    isSyncing
  } = useFinance();
  const { adminUsername, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Integration fields
  const [gasUrl, setGasUrl] = useState(getGasBackendUrl());
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Migration state
  const [migrationStatus, setMigrationStatus] = useState<MigrationSummary>(getLocalStorageMigrationStatus());
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await migrateLocalStorageToGoogleSheets();
      if (res.success) {
        setMigrationResult({
          success: true,
          message: 'All local records successfully verified and migrated to Google Sheets master database!',
          details: res.summary
        });
        setMigrationStatus(getLocalStorageMigrationStatus());
        await refreshData();
      } else {
        setMigrationResult({
          success: false,
          message: res.error || 'Failed to migrate records to Google Sheets.'
        });
      }
    } catch (err: any) {
      setMigrationResult({
        success: false,
        message: err.message || 'Migration encountered an error.'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Password fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleManualSync = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await callBackendApi('ping');
      await refreshData();
      if (res.success) {
        setTestResult({
          success: true,
          message: 'Database connection verified! Financial records synchronized successfully with Google Sheets.'
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Failed to connect to central Google Sheets database.'
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Synchronization failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveGasUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);
    try {
      setGasBackendUrl(gasUrl);
      const res = await callBackendApi('ping');
      if (res.success) {
        setTestResult({
          success: true,
          message: 'Central backend endpoint URL updated and verified successfully!'
        });
        await refreshData();
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Could not connect to backend with the provided URL.'
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPass !== confirmPass) {
      setPassMessage({ success: false, text: 'New passwords do not match.' });
      return;
    }
    if (newPass.length < 6) {
      setPassMessage({ success: false, text: 'Password must be at least 6 characters.' });
      return;
    }

    const res = await changePassword(currentPass, newPass);
    if (res.success) {
      setPassMessage({ success: true, text: 'Password successfully updated!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassMessage({ success: false, text: res.error || 'Failed to update password.' });
    }
  };

  const handleExportBackup = () => {
    const db = loadLocalDb();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FLAVENCIA_2026_MASTER_BACKUP_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async event => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.settings) {
            saveLocalDb(parsed);
            await refreshData();
            alert('Database backup restored successfully!');
          } else {
            alert('Invalid backup file structure.');
          }
        } catch (err) {
          alert('Failed to parse JSON backup.');
        }
      };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#1E3A5F]" />
          <span>System & Database Configuration</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Master integration settings, security credentials, and festival metadata
        </p>
      </div>

      {/* 1. Google Sheets Database Connection Status */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1E3A5F]" />
              Google Sheets Master Database Status
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Centrally connected to master Google Spreadsheet. No manual spreadsheet ID configuration required.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isBackendConnected && !syncError
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : 'bg-rose-50 text-[#DC2626] border border-rose-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected && !syncError ? 'bg-[#16A34A] animate-pulse' : 'bg-[#DC2626]'
              }`}
            />
            {isBackendConnected && !syncError ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-[#16A34A]'
                : 'bg-rose-50 border border-rose-200 text-[#DC2626]'
            }`}
          >
            {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {testResult.message}
          </div>
        )}

        {syncError && !testResult && (
          <div className="p-3 rounded-lg text-xs font-medium flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Database Sync Notice: {syncError}</span>
          </div>
        )}

        {/* Database Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Database Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected && !syncError ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
              <span className="font-bold text-gray-900 text-sm">
                {isBackendConnected && !syncError ? 'Connected & Live' : 'Disconnected'}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 block">Central Google Sheets Master</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Last Successful Sync</span>
            <span className="font-bold text-gray-900 text-sm mt-1 block">
              {lastSyncedAt ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending initial sync'}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">
              {lastSyncedAt ? lastSyncedAt.toLocaleDateString() : 'Auto-sync active'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Multi-Device Architecture</span>
            <span className="font-bold text-[#1E3A5F] text-sm mt-1 block">
              Centralized Backend
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5 block">All 10 Sheets Synchronized</span>
          </div>
        </div>

        {/* Informational Card */}
        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="font-bold text-gray-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Centralized Automatic Connectivity</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            The Google Spreadsheet ID is configured securely on the server backend. All phones, laptops, and admin terminals automatically synchronize with the exact same master financial spreadsheet without requiring manual Spreadsheet ID configuration.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowAdvancedUrl(!showAdvancedUrl)}
            className="text-xs text-gray-500 hover:text-[#1E3A5F] underline transition-colors self-start sm:self-auto"
          >
            {showAdvancedUrl ? 'Hide Backend Endpoint' : 'Backend Endpoint Settings'}
          </button>

          <button
            onClick={handleManualSync}
            disabled={isTesting || isSyncing}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white flex items-center gap-2 shadow-none transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting || isSyncing ? 'animate-spin' : ''}`} />
            {isTesting || isSyncing ? 'Synchronizing with Google Sheets...' : 'Sync Database Now'}
          </button>
        </div>

        {/* Optional Collapsible Endpoint Form */}
        {showAdvancedUrl && (
          <form onSubmit={handleSaveGasUrl} className="pt-3 border-t border-gray-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Google Apps Script Web App URL (/exec)
              </label>
              <input
                type="url"
                value={gasUrl}
                onChange={e => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-mono focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Set via <code className="text-[#1E3A5F] font-mono font-semibold">VITE_GAS_URL</code> environment variable on Vercel. You may update it here if your deployment URL changes.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-colors"
              >
                Save Backend URL
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Centralized Multi-Device Synchronization */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1E3A5F]" />
              Centralized Multi-Device Real-Time Sync
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Single source of truth: all phones, tablets, and computers communicate directly with the same Google Sheets backend.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Central Sync Active
          </span>
        </div>

        {/* Visual Multi-Device Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-lg bg-[#F3F4F6] border border-gray-200 flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">Mobile Phone / Tablet</div>
              <div className="text-[11px] text-gray-500">Live fetch & direct entry</div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-50 border border-navy-200 flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#1E3A5F]">Google Sheets Master DB</div>
              <div className="text-[11px] text-[#1E3A5F]/80">Single Master Source of Truth</div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F3F4F6] border border-gray-200 flex items-center gap-3">
            <Laptop className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">Laptop / Admin PC</div>
              <div className="text-[11px] text-gray-500">Instant synced dashboard</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1">
          <p className="font-semibold text-gray-800">No Browser-Isolated Storage</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Financial records are never isolated in a single browser's LocalStorage. Transactions, categories, and account updates entered on any device are saved directly to Google Sheets and auto-refreshed across all connected devices upon focus or refresh.
          </p>
        </div>
      </div>

      {/* 3. LocalStorage Data Migration Engine */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#1E3A5F]" />
              Local Storage Data Migration to Central Database
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Inspect browser-cached financial entries and migrate them safely into Google Sheets with verified deduplication
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              migrationStatus.hasPendingData
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
            }`}
          >
            {migrationStatus.hasPendingData ? 'Records Pending Migration' : 'Fully Synchronized'}
          </span>
        </div>

        {migrationResult && (
          <div
            className={`p-3.5 rounded-lg text-xs font-medium flex flex-col gap-1.5 ${
              migrationResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-[#16A34A]'
                : 'bg-rose-50 border border-rose-200 text-[#DC2626]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {migrationResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{migrationResult.message}</span>
            </div>
            {migrationResult.details && (
              <div className="text-[11px] opacity-90 pl-6 space-y-0.5">
                <div>• Migrated: {JSON.stringify(migrationResult.details.migrated || {})}</div>
                <div>• Skipped duplicates: {JSON.stringify(migrationResult.details.skipped || {})}</div>
                {migrationResult.details.backupKey && (
                  <div>• Pre-migration safety backup created: <code className="font-mono">{migrationResult.details.backupKey}</code></div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Income Records</span>
            <span className="font-bold text-gray-900 text-sm">
              {migrationStatus.localRecordCount.income}
            </span>
            <span className="block text-[10px] text-[#16A34A] font-semibold mt-0.5">
              {formatCurrency(migrationStatus.totalIncomeAmount)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Expense Records</span>
            <span className="font-bold text-gray-900 text-sm">
              {migrationStatus.localRecordCount.expenses}
            </span>
            <span className="block text-[10px] text-[#DC2626] font-semibold mt-0.5">
              {formatCurrency(migrationStatus.totalExpenseAmount)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Transactions</span>
            <span className="font-bold text-gray-900 text-sm">
              {migrationStatus.localRecordCount.transactions}
            </span>
            <span className="block text-[10px] text-gray-500 mt-0.5">Ledger Entries</span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Custom Categories</span>
            <span className="font-bold text-gray-900 text-sm">
              {migrationStatus.localRecordCount.categories}
            </span>
            <span className="block text-[10px] text-gray-500 mt-0.5">Defined</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
          <span className="text-[11px] text-gray-500">
            Safety guarantee: An immutable local backup is saved before transmission. Duplicates already present in Google Sheets are skipped.
          </span>
          <button
            onClick={handleRunMigration}
            disabled={isMigrating || !migrationStatus.hasPendingData}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-none transition-all self-start sm:self-auto ${
              migrationStatus.hasPendingData
                ? 'bg-[#1E3A5F] hover:bg-[#172E4D] text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isMigrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
            {isMigrating ? 'Migrating to Google Sheets...' : 'Migrate Local Data to Google Sheets'}
          </button>
        </div>
      </div>

      {/* 4. Admin Security & Password Change */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#1E3A5F]" />
            Admin Security & Password Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Single Admin account: <strong className="text-gray-900">{adminUsername}</strong>
          </p>
        </div>

        {passMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              passMessage.success
                ? 'bg-emerald-50 border border-emerald-200 text-[#16A34A]'
                : 'bg-rose-50 border border-rose-200 text-[#DC2626]'
            }`}
          >
            {passMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Current password"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 5. Festival Details & UI Preferences */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1E3A5F]" />
          Festival Branding & Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Festival Name</span>
            <span className="font-bold text-gray-900 text-sm">FLAVENCIA 2026</span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Official Tagline</span>
            <span className="font-bold text-[#1E3A5F] text-sm">BEYOND BOUNDARIES</span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Base Currency</span>
            <span className="font-bold text-gray-900">INR (₹ Indian Rupee)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#F3F4F6] border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Official Timezone</span>
            <span className="font-bold text-gray-900">Asia/Kolkata (IST, UTC+05:30)</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Application Visual Theme Mode</span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-[#374151] hover:bg-gray-50 transition-colors"
          >
            Current Theme: {theme.toUpperCase()}
          </button>
        </div>
      </div>

      {/* 6. Data Safety & Master Backup */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#1E3A5F]" />
            Data Safety, Master Backup & Recovery
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Download JSON backups of the complete database tabs or restore from existing backups
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white transition-colors shadow-none"
          >
            <Download className="w-4 h-4" />
            Download Complete Master JSON Backup
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Restore from JSON Backup File
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
