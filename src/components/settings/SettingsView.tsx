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
  ExternalLink
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getGasBackendUrl,
  setGasBackendUrl,
  getSpreadsheetId,
  setSpreadsheetId,
  getDriveFolderId,
  setDriveFolderId,
  callBackendApi,
  loadLocalDb,
  saveLocalDb
} from '../../services/api';

export const SettingsView: React.FC = () => {
  const { refreshData, isBackendConnected } = useFinance();
  const { adminUsername, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Integration fields
  const [gasUrl, setGasUrl] = useState(getGasBackendUrl());
  const [sheetId, setSheetId] = useState(getSpreadsheetId());
  const [driveId, setDriveId] = useState(getDriveFolderId());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Password fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSaveIntegration = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      setGasBackendUrl(gasUrl);
      setSpreadsheetId(sheetId);
      setDriveFolderId(driveId);

      // Ping backend
      const res = await callBackendApi('ping');
      if (res.success) {
        setTestResult({
          success: true,
          message: 'Connection Successful! Linked to Google Apps Script backend.'
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Failed to connect. Please verify the URL and deployment settings.'
        });
      }
      await refreshData();
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-gold-500" />
          <span>System & Database Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Master integration settings, security credentials, and festival metadata
        </p>
      </div>

      {/* 1. Google Sheets & Apps Script Integration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              Google Sheets Master Database & Apps Script API
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect the web app directly to your Google Spreadsheet and Google Drive
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isBackendConnected
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gold-400'
              }`}
            />
            {isBackendConnected ? 'Live Google Sheets' : 'Local Offline Engine'}
          </span>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {testResult.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Google Apps Script Web App URL (/exec) *
            </label>
            <input
              type="url"
              value={gasUrl}
              onChange={e => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Deploy your Apps Script as Web App with Access: "Anyone". See deployment guide in{' '}
              <code className="text-gold-400">google-apps-script/DEPLOYMENT_INSTRUCTIONS.md</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Google Drive Root Folder ID
              </label>
              <input
                type="text"
                value={driveId}
                onChange={e => setDriveId(e.target.value)}
                placeholder="e.g. 1a2b3c4d5e6f7g8h9"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Works seamlessly in both connected Google Sheets mode and local simulated ledger mode.
            </span>
            <button
              onClick={handleSaveIntegration}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-600 text-slate-950 flex items-center gap-2 shadow-sm transition-all"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Save & Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Security & Password Change */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-gold-500" />
            Admin Security & Password Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single Admin account: <strong className="text-slate-200">{adminUsername}</strong>
          </p>
        </div>

        {passMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              passMessage.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {passMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Current password"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1A22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 3. Festival Details & UI Preferences */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-500" />
          Festival Branding & Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Festival Name</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">FLAVENCIA 2026</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Tagline</span>
            <span className="font-bold text-gold-400 text-sm">BEYOND BOUNDARIES</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Currency</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">INR (₹ Indian Rupee)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Timezone</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">Asia/Kolkata (IST, UTC+05:30)</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">Application Visual Theme Mode</span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Current Theme: {theme.toUpperCase()}
          </button>
        </div>
      </div>

      {/* 4. Data Safety & Master Backup */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gold-500" />
            Data Safety, Master Backup & Recovery
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download JSON backups of the complete database tabs or restore from existing backups
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gold-500 hover:bg-gold-600 text-slate-950 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Complete Master JSON Backup
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Restore from JSON Backup File
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
