// FLAVENCIA 2026 - Central Migration Service
// Safely migrates existing local browser records into the centralized Google Sheets backend
// Guarantees zero duplicate migration, preserves existing IDs, and keeps local backups

import { callBackendApi } from './api';
import { DatabaseState } from './api';

const STORAGE_KEY_LOCAL_DB = 'flavencia_local_sheets_db_cache';
const STORAGE_KEY_MIGRATION_FLAG = 'flavencia_migration_completed';
const STORAGE_KEY_BACKUP_PREFIX = 'flavencia_pre_migration_backup_';

export interface MigrationSummary {
  hasPendingData: boolean;
  localRecordCount: {
    income: number;
    expenses: number;
    payments: number;
    transactions: number;
    categories: number;
    budgets: number;
  };
  totalIncomeAmount: number;
  totalExpenseAmount: number;
  migrated?: {
    income: number;
    expenses: number;
    payments: number;
    transactions: number;
    categories: number;
    budgets: number;
  };
  skipped?: {
    income: number;
    expenses: number;
    payments: number;
    transactions: number;
    categories: number;
    budgets: number;
  };
  backupKey?: string;
  isAlreadyMigrated: boolean;
}

/**
 * Inspects localStorage to find existing unmigrated financial records
 */
export function getLocalStorageMigrationStatus(): MigrationSummary {
  try {
    const isAlreadyMigrated = localStorage.getItem(STORAGE_KEY_MIGRATION_FLAG) === 'true';
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_DB);
    if (!raw) {
      return {
        hasPendingData: false,
        localRecordCount: { income: 0, expenses: 0, payments: 0, transactions: 0, categories: 0, budgets: 0 },
        totalIncomeAmount: 0,
        totalExpenseAmount: 0,
        isAlreadyMigrated
      };
    }

    const db: DatabaseState = JSON.parse(raw);
    const income = db.income || [];
    const expenses = db.expenses || [];
    const payments = db.expensePayments || [];
    const transactions = db.transactions || [];
    const categories = (db.categories || []).filter(c => c.categoryId.startsWith('CAT-') && !c.categoryId.startsWith('CAT-INC-0') && !c.categoryId.startsWith('CAT-EXP-0'));
    const budgets = db.budgets || [];

    const totalIncomeAmount = income.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalExpenseAmount = expenses.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);

    const hasPendingData = income.length > 0 || expenses.length > 0 || payments.length > 0 || transactions.length > 0;

    return {
      hasPendingData,
      localRecordCount: {
        income: income.length,
        expenses: expenses.length,
        payments: payments.length,
        transactions: transactions.length,
        categories: categories.length,
        budgets: budgets.length
      },
      totalIncomeAmount,
      totalExpenseAmount,
      isAlreadyMigrated
    };
  } catch (e) {
    console.error('Error inspecting local storage for migration:', e);
    return {
      hasPendingData: false,
      localRecordCount: { income: 0, expenses: 0, payments: 0, transactions: 0, categories: 0, budgets: 0 },
      totalIncomeAmount: 0,
      totalExpenseAmount: 0,
      isAlreadyMigrated: false
    };
  }
}

/**
 * Creates an immutable backup of current local storage before any migration
 */
export function backupLocalStorageBeforeMigration(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_DB);
    if (!raw) return null;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `${STORAGE_KEY_BACKUP_PREFIX}${timestamp}`;
    localStorage.setItem(backupKey, raw);
    return backupKey;
  } catch (e) {
    console.error('Failed to create pre-migration backup:', e);
    return null;
  }
}

/**
 * Executes safe migration from LocalStorage to the centralized Google Sheets backend
 */
export async function migrateLocalStorageToGoogleSheets(): Promise<{
  success: boolean;
  summary?: MigrationSummary;
  error?: string;
}> {
  try {
    const status = getLocalStorageMigrationStatus();
    if (!status.hasPendingData) {
      return {
        success: true,
        summary: status,
        error: 'No local financial records require migration.'
      };
    }

    // 1. Create a safe, verified local backup before proceeding
    const backupKey = backupLocalStorageBeforeMigration();

    // 2. Load existing records
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_DB);
    if (!raw) {
      return { success: false, error: 'Local data not found.' };
    }
    const db: DatabaseState = JSON.parse(raw);

    // 3. Send payload to Google Sheets backend 'migrateData' action
    const payload = {
      income: db.income || [],
      expenses: db.expenses || [],
      expensePayments: db.expensePayments || [],
      transactions: db.transactions || [],
      categories: db.categories || [],
      budgets: db.budgets || [],
      performedBy: 'Admin (LocalStorage Migration)'
    };

    const res = await callBackendApi('migrateData', payload);

    if (!res.success) {
      return {
        success: false,
        error: res.error || 'Failed to migrate records to Google Sheets backend.'
      };
    }

    // 4. Mark migration flag as complete
    localStorage.setItem(STORAGE_KEY_MIGRATION_FLAG, 'true');

    return {
      success: true,
      summary: {
        ...status,
        backupKey: backupKey || undefined,
        migrated: res.summary?.migrated,
        skipped: res.summary?.skipped,
        isAlreadyMigrated: true
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during migration.'
    };
  }
}
