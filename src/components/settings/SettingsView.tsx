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
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#1E3A5F]" />
          <span>System & Database Configuration</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Master integration settings, security credentials, and festival metadata
        </p>
      </div>

      {/* 1. Google Sheets & Apps Script Integration */}
      <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-none space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#16A34A]" />
              Google Sheets Master Database & Apps Script API
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect the web app directly to your Google Spreadsheet and Google Drive
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isBackendConnected
                ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                : 'bg-navy-50 text-[#1E3A5F] border border-navy-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-[#16A34A] animate-pulse' : 'bg-[#1E3A5F]'
              }`}
            />
            {isBackendConnected ? 'Live Google Sheets' : 'Local Offline Engine'}
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

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Google Apps Script Web App URL (/exec) *
            </label>
            <input
              type="url"
              value={gasUrl}
              onChange={e => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full text-xs px-3 py-2.5 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-mono focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Deploy your Apps Script as Web App with Access: "Anyone". See deployment guide in{' '}
              <code className="text-[#1E3A5F] font-mono font-semibold">google-apps-script/DEPLOYMENT_INSTRUCTIONS.md</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-mono focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Google Drive Root Folder ID
              </label>
              <input
                type="text"
                value={driveId}
                onChange={e => setDriveId(e.target.value)}
                placeholder="e.g. 1a2b3c4d5e6f7g8h9"
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#F3F4F6] border border-gray-200 text-[#374151] font-mono focus:bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Works seamlessly in both connected Google Sheets mode and local simulated ledger mode.
            </span>
            <button
              onClick={handleSaveIntegration}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] hover:bg-[#172E4D] text-white flex items-center gap-2 shadow-none transition-all self-start sm:self-auto"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Save & Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Security & Password Change */}
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

      {/* 3. Festival Details & UI Preferences */}
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

      {/* 4. Data Safety & Master Backup */}
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
