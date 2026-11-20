// FLAVENCIA 2026 - Central Backend Configuration
// Centralized configuration for Google Sheets & Google Apps Script backend.
// NOTE: The Google Spreadsheet ID is configured CENTRALLY on the server backend
// (Google Apps Script). The frontend connects automatically and does NOT require
// or expose any manual Spreadsheet ID input.

export const STORAGE_KEY_GAS_URL = 'flavencia_gas_url';
export const STORAGE_KEY_LOCAL_BACKUP = 'flavencia_local_sheets_db_backup';
export const STORAGE_KEY_MIGRATION_DONE = 'flavencia_migrated_to_sheets';

// Default central Apps Script URL (from environment variable VITE_GAS_URL)
export const ENV_GAS_URL: string = ((import.meta as any).env?.VITE_GAS_URL as string) || '';

/**
 * Get the centralized Google Apps Script Web App URL
 * Priority:
 * 1. Admin local override in localStorage (if set)
 * 2. Environment variable VITE_GAS_URL
 */
export function getCentralGasUrl(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const local = localStorage.getItem(STORAGE_KEY_GAS_URL);
    if (local && local.trim()) return local.trim();
  }
  return ENV_GAS_URL.trim();
}

/**
 * Set admin override for Google Apps Script Web App URL
 */
export function setCentralGasUrl(url: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (url.trim()) {
      localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GAS_URL);
    }
  }
}

/**
 * Backwards-compatibility stubs.
 * Spreadsheet ID is configured centrally on the server-side backend.
 */
export function getCentralSpreadsheetId(): string {
  return '';
}

export function setCentralSpreadsheetId(_id: string): void {
  // No-op: Spreadsheet ID is managed centrally on the backend
}

export function getCentralDriveFolderId(): string {
  return '';
}

export function setCentralDriveFolderId(_id: string): void {
  // No-op: Drive folders are managed centrally on the backend
}
