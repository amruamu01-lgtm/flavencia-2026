// FLAVENCIA 2026 - Master Financial State & Operations Engine

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  IncomeRecord,
  ExpenseRecord,
  ExpensePaymentRecord,
  TransactionRecord,
  CategoryRecord,
  AccountRecord,
  TransferRecord,
  BudgetRecord,
  AuditLogRecord,
  SettingItem,
  DashboardStats,
  DateFilterOption,
  FinalSettlementData,
  PaymentMethod
} from '../types/financial';
import { callBackendApi, getGasBackendUrl, loadLocalDb, saveLocalDb } from '../services/api';
import { formatDate } from '../utils/formatters';

interface FinanceContextType {
  // Data Collections
  incomeList: IncomeRecord[];
  expenseList: ExpenseRecord[];
  paymentList: ExpensePaymentRecord[];
  transactionList: TransactionRecord[];
  categoryList: CategoryRecord[];
  accountList: AccountRecord[];
  transferList: TransferRecord[];
  budgetList: BudgetRecord[];
  auditLogList: AuditLogRecord[];
  settingsList: SettingItem[];

  // Filter State
  dateFilter: DateFilterOption;
  setDateFilter: (filter: DateFilterOption) => void;
  filteredIncome: IncomeRecord[];
  filteredExpenses: ExpenseRecord[];
  filteredTransactions: TransactionRecord[];

  // Computed Summaries
  dashboardStats: DashboardStats;
  finalSettlementData: FinalSettlementData;

  // Actions
  refreshData: () => Promise<void>;
  addIncome: (data: Omit<IncomeRecord, 'incomeId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  addExpense: (data: Omit<ExpenseRecord, 'expenseId' | 'balanceAmount' | 'paymentStatus' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  recordPayment: (expenseId: string, amount: number, accountId: string, paymentMethod: PaymentMethod, paymentDate?: string, refNo?: string, remarks?: string) => Promise<{ success: boolean; error?: string }>;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, transferDate?: string, refNo?: string, desc?: string) => Promise<{ success: boolean; error?: string }>;
  saveBudget: (categoryId: string, budgetAmount: number) => Promise<{ success: boolean; error?: string }>;
  deleteBudget: (budgetId: string) => Promise<{ success: boolean; error?: string }>;
  addCategory: (name: string, type: 'INCOME' | 'EXPENSE', desc?: string) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (categoryId: string, name: string, type: 'INCOME' | 'EXPENSE', desc?: string, isActive?: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  addAccount: (name: string, type: any, openingBalance: number) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (key: string, value: string) => Promise<{ success: boolean; error?: string }>;

  // Loading & Submission Guards
  loading: boolean;
  submitting: boolean;
  isBackendConnected: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  isSyncing: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomeList, setIncomeList] = useState<IncomeRecord[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseRecord[]>([]);
  const [paymentList, setPaymentList] = useState<ExpensePaymentRecord[]>([]);
  const [transactionList, setTransactionList] = useState<TransactionRecord[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([]);
  const [accountList, setAccountList] = useState<AccountRecord[]>([]);
  const [transferList, setTransferList] = useState<TransferRecord[]>([]);
  const [budgetList, setBudgetList] = useState<BudgetRecord[]>([]);
  const [auditLogList, setAuditLogList] = useState<AuditLogRecord[]>([]);
  const [settingsList, setSettingsList] = useState<SettingItem[]>([]);

  const [dateFilter, setDateFilter] = useState<DateFilterOption>({
    key: 'ALL_TIME',
    label: 'All Time'
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load all initial financial data from Central Database
  const refreshData = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await callBackendApi('getAllData');
      if (res.success && res.data) {
        setIncomeList(res.data.income || []);
        setExpenseList(res.data.expenses || []);
        setPaymentList(res.data.expensePayments || []);
        setTransactionList(res.data.transactions || []);
        setCategoryList(res.data.categories || []);
        setAccountList(res.data.accounts || []);
        setTransferList(res.data.transfers || []);
        setBudgetList(res.data.budgets || []);
        setAuditLogList(res.data.auditLogs || []);
        setSettingsList(res.data.settings || []);
        setLastSyncedAt(new Date());
        setSyncError(null);
      } else {
        setSyncError(res.error || 'Failed to sync data with central database');
      }
      setIsBackendConnected(!!getGasBackendUrl());
    } catch (err: any) {
      console.error('Error refreshing finance data:', err);
      setSyncError(err.message || 'Network error syncing with Google Sheets');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Multi-device sync: auto-refresh when tab/window regains focus
    const handleFocus = () => {
      refreshData();
    };
    window.addEventListener('focus', handleFocus);

    // Periodic background sync every 30 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Compute Account Balances dynamically with Running Totals
  const enrichedAccounts = useMemo(() => {
    return accountList.map(acc => {
      const credits = transactionList
        .filter(t => t.accountId === acc.accountId && t.direction === 'CREDIT')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const debits = transactionList
        .filter(t => t.accountId === acc.accountId && t.direction === 'DEBIT')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const currentBalance = (Number(acc.openingBalance) || 0) + credits - debits;

      return {
        ...acc,
        totalCredits: credits,
        totalDebits: debits,
        currentBalance
      };
    });
  }, [accountList, transactionList]);

  // Date Filter Calculations
  const isDateInFilter = (dateStr: string): boolean => {
    if (!dateStr) return false;
    if (dateFilter.key === 'ALL_TIME') return true;

    const target = new Date(dateStr);
    const now = new Date();

    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    switch (dateFilter.key) {
      case 'TODAY':
        return dateStr === todayStr;
      case 'YESTERDAY':
        return dateStr === yesterdayStr;
      case 'LAST_7_DAYS': {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return target >= sevenDaysAgo && target <= now;
      }
      case 'THIS_MONTH':
        return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
      case 'PREVIOUS_MONTH': {
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return target.getFullYear() === prevMonth.getFullYear() && target.getMonth() === prevMonth.getMonth();
      }
      case 'CUSTOM':
        if (dateFilter.startDate && dateFilter.endDate) {
          return dateStr >= dateFilter.startDate && dateStr <= dateFilter.endDate;
        }
        return true;
      default:
        return true;
    }
  };

  const filteredIncome = useMemo(() => {
    return incomeList.filter(item => isDateInFilter(item.date));
  }, [incomeList, dateFilter]);

  const filteredExpenses = useMemo(() => {
    return expenseList.filter(item => isDateInFilter(item.date));
  }, [expenseList, dateFilter]);

  const filteredTransactions = useMemo(() => {
    const list = transactionList.filter(item => isDateInFilter(item.transactionDate));
    // Calculate running balance and account name mapping
    let running = 0;
    // Map in chronological order
    const sorted = [...list].sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
    const enriched = sorted.map(t => {
      if (t.direction === 'CREDIT') {
        running += Number(t.amount) || 0;
      } else {
        running -= Number(t.amount) || 0;
      }
      const acc = enrichedAccounts.find(a => a.accountId === t.accountId);
      return {
        ...t,
        accountName: acc ? acc.accountName : t.accountId,
        runningBalance: running
      };
    });
    // Return newest first
    return enriched.reverse();
  }, [transactionList, enrichedAccounts, dateFilter]);

  // Dashboard Statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // In filtered range:
    const totalIncome = filteredIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    // Paid expenses only!
    const totalPaidExpenses = filteredExpenses.reduce((sum, item) => sum + (Number(item.paidAmount) || 0), 0);
    const netAvailableBalance = totalIncome - totalPaidExpenses;

    // Outstanding expenses (balanceAmount on all filtered unpaid/partially paid expenses)
    const outstandingExpenses = filteredExpenses.reduce((sum, item) => sum + (Number(item.balanceAmount) || 0), 0);

    // Account Balances (from liquid accounts)
    const cashAcc = enrichedAccounts.find(a => a.accountType === 'CASH');
    const bankAcc = enrichedAccounts.find(a => a.accountType === 'BANK');
    const upiAcc = enrichedAccounts.find(a => a.accountType === 'UPI');

    const cashInHand = cashAcc?.currentBalance ?? 0;
    const bankBalance = bankAcc?.currentBalance ?? 0;
    const upiBalance = upiAcc?.currentBalance ?? 0;

    // Today & Month Stats
    const todayIncome = incomeList
      .filter(i => i.date === todayStr)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const todayExpenses = expenseList
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);

    const thisMonthIncome = incomeList
      .filter(i => {
        const d = new Date(i.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const thisMonthExpenses = expenseList
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);

    // Donations & Sponsorships
    const totalDonations = filteredIncome
      .filter(i => {
        const cat = categoryList.find(c => c.categoryId === i.categoryId);
        return cat?.categoryName.toLowerCase().includes('donation') || i.sourceName.toLowerCase().includes('donation');
      })
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const totalSponsorships = filteredIncome
      .filter(i => {
        const cat = categoryList.find(c => c.categoryId === i.categoryId);
        return cat?.categoryName.toLowerCase().includes('sponsor') || i.sourceName.toLowerCase().includes('sponsor');
      })
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    // Highest Expense Category (by paid amount)
    const expenseByCatMap: { [catId: string]: number } = {};
    filteredExpenses.forEach(e => {
      expenseByCatMap[e.categoryId] = (expenseByCatMap[e.categoryId] || 0) + (Number(e.paidAmount) || 0);
    });

    let highestCat: { name: string; amount: number } | null = null;
    Object.entries(expenseByCatMap).forEach(([catId, amt]) => {
      if (!highestCat || amt > highestCat.amount) {
        const cat = categoryList.find(c => c.categoryId === catId);
        highestCat = { name: cat ? cat.categoryName : catId, amount: amt };
      }
    });

    const totalUnpaidExpensesCount = filteredExpenses.filter(e => e.paymentStatus !== 'PAID').length;

    return {
      totalIncome,
      totalPaidExpenses,
      netAvailableBalance,
      cashInHand,
      bankBalance,
      upiBalance,
      outstandingExpenses,
      totalTransactions: filteredTransactions.length,
      todayIncome,
      todayExpenses,
      thisMonthIncome,
      thisMonthExpenses,
      totalDonations,
      totalSponsorships,
      highestExpenseCategory: highestCat,
      totalUnpaidExpensesCount
    };
  }, [filteredIncome, filteredExpenses, filteredTransactions, incomeList, expenseList, enrichedAccounts, categoryList]);

  // Final Settlement Computed Data
  const finalSettlementData: FinalSettlementData = useMemo(() => {
    // Grand total income across ALL records
    const grandTotalIncome = incomeList.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const grandTotalPaidExpenses = expenseList.reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);
    const netAvailableBalance = grandTotalIncome - grandTotalPaidExpenses;

    // Income breakdown by category
    const incCatMap: { [catId: string]: number } = {};
    incomeList.forEach(i => {
      incCatMap[i.categoryId] = (incCatMap[i.categoryId] || 0) + (Number(i.amount) || 0);
    });
    const incomeByCategory = Object.entries(incCatMap).map(([catId, amount]) => {
      const cat = categoryList.find(c => c.categoryId === catId);
      return { categoryName: cat ? cat.categoryName : catId, amount };
    });

    // Specific Income Groups
    let donationsIncome = 0;
    let sponsorshipIncome = 0;
    let registrationIncome = 0;
    let otherIncome = 0;

    incomeList.forEach(i => {
      const cat = categoryList.find(c => c.categoryId === i.categoryId);
      const name = (cat?.categoryName || '').toLowerCase();
      const amt = Number(i.amount) || 0;
      if (name.includes('donation')) donationsIncome += amt;
      else if (name.includes('sponsor')) sponsorshipIncome += amt;
      else if (name.includes('registration') || name.includes('competition')) registrationIncome += amt;
      else otherIncome += amt;
    });

    // Expense breakdown by category
    const expCatMap: { [catId: string]: number } = {};
    expenseList.forEach(e => {
      expCatMap[e.categoryId] = (expCatMap[e.categoryId] || 0) + (Number(e.paidAmount) || 0);
    });
    const expensesByCategory = Object.entries(expCatMap).map(([catId, amount]) => {
      const cat = categoryList.find(c => c.categoryId === catId);
      return { categoryName: cat ? cat.categoryName : catId, amount };
    });

    // Specific Expense Groups
    let stageAndSoundPaid = 0;
    let foodAndCateringPaid = 0;
    let printingPaid = 0;
    let transportationPaid = 0;
    let giftsPaid = 0;
    let otherExpensesPaid = 0;

    expenseList.forEach(e => {
      const cat = categoryList.find(c => c.categoryId === e.categoryId);
      const name = (cat?.categoryName || '').toLowerCase();
      const amt = Number(e.paidAmount) || 0;
      if (name.includes('stage') || name.includes('sound')) stageAndSoundPaid += amt;
      else if (name.includes('food') || name.includes('catering')) foodAndCateringPaid += amt;
      else if (name.includes('print')) printingPaid += amt;
      else if (name.includes('transport')) transportationPaid += amt;
      else if (name.includes('gift') || name.includes('prize')) giftsPaid += amt;
      else otherExpensesPaid += amt;
    });

    // Outstanding summary
    let unpaidExpensesTotal = 0;
    let partiallyPaidExpensesTotal = 0;

    expenseList.forEach(e => {
      if (e.paymentStatus === 'UNPAID') {
        unpaidExpensesTotal += Number(e.balanceAmount) || 0;
      } else if (e.paymentStatus === 'PARTIALLY PAID') {
        partiallyPaidExpensesTotal += Number(e.balanceAmount) || 0;
      }
    });
    const totalOutstandingAmount = unpaidExpensesTotal + partiallyPaidExpensesTotal;

    // Balances
    const cashAcc = enrichedAccounts.find(a => a.accountType === 'CASH');
    const bankAcc = enrichedAccounts.find(a => a.accountType === 'BANK');
    const upiAcc = enrichedAccounts.find(a => a.accountType === 'UPI');

    const accountsBreakdown = enrichedAccounts.map(a => ({
      accountName: a.accountName,
      balance: a.currentBalance || 0
    }));

    return {
      festivalName: 'FLAVENCIA 2026',
      festivalYear: '2026',
      tagline: 'BEYOND BOUNDARIES',
      preparedDate: formatDate(new Date().toISOString().split('T')[0]),
      donationsIncome,
      sponsorshipIncome,
      registrationIncome,
      otherIncome,
      grandTotalIncome,
      incomeByCategory,
      stageAndSoundPaid,
      foodAndCateringPaid,
      printingPaid,
      transportationPaid,
      giftsPaid,
      otherExpensesPaid,
      grandTotalPaidExpenses,
      expensesByCategory,
      unpaidExpensesTotal,
      partiallyPaidExpensesTotal,
      totalOutstandingAmount,
      netAvailableBalance,
      cashInHand: cashAcc?.currentBalance || 0,
      bankBalance: bankAcc?.currentBalance || 0,
      upiBalance: upiAcc?.currentBalance || 0,
      otherBalance: 0,
      accountsBreakdown
    };
  }, [incomeList, expenseList, enrichedAccounts, categoryList]);

  // Actions with Duplicate Protection
  const addIncome = async (data: Omit<IncomeRecord, 'incomeId' | 'createdAt' | 'updatedAt'>) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('addIncome', data);
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to add income' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const addExpense = async (data: Omit<ExpenseRecord, 'expenseId' | 'balanceAmount' | 'paymentStatus' | 'createdAt' | 'updatedAt'>) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('addExpense', data);
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to add expense' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const recordPayment = async (
    expenseId: string,
    amount: number,
    accountId: string,
    paymentMethod: PaymentMethod,
    paymentDate?: string,
    refNo?: string,
    remarks?: string
  ) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('recordPayment', {
        expenseId,
        amount,
        accountId,
        paymentMethod,
        paymentDate,
        referenceNumber: refNo,
        remarks
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to record payment' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const transferFunds = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    transferDate?: string,
    refNo?: string,
    desc?: string
  ) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('transferFunds', {
        fromAccountId,
        toAccountId,
        amount,
        transferDate,
        referenceNumber: refNo,
        description: desc
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to transfer funds' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const saveBudget = async (categoryId: string, budgetAmount: number) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('setBudget', { categoryId, budgetAmount });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to save budget' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBudget = async (budgetId: string) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('deleteBudget', { budgetId });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete budget' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const addCategory = async (name: string, type: 'INCOME' | 'EXPENSE', desc?: string) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('addCategory', { categoryName: name, categoryType: type, description: desc });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to add category' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const updateCategory = async (categoryId: string, name: string, type: 'INCOME' | 'EXPENSE', desc?: string, isActive = true) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('updateCategory', {
        categoryId,
        categoryName: name,
        categoryType: type,
        description: desc,
        isActive
      });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update category' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('deleteCategory', { categoryId });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete category' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const addAccount = async (name: string, type: any, openingBalance: number) => {
    if (submitting) return { success: false, error: 'Operation in progress' };
    setSubmitting(true);
    try {
      const res = await callBackendApi('addAccount', { accountName: name, accountType: type, openingBalance });
      if (res.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to add account' };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
    }
  };

  const updateSettings = async (key: string, value: string) => {
    try {
      const db = loadLocalDb();
      const existing = db.settings.find(s => s.settingKey === key);
      const now = new Date().toISOString();
      if (existing) {
        existing.settingValue = value;
        existing.updatedAt = now;
      } else {
        db.settings.push({ settingKey: key, settingValue: value, updatedAt: now });
      }
      saveLocalDb(db);
      await refreshData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        incomeList,
        expenseList,
        paymentList,
        transactionList,
        categoryList,
        accountList: enrichedAccounts,
        transferList,
        budgetList,
        auditLogList,
        settingsList,
        dateFilter,
        setDateFilter,
        filteredIncome,
        filteredExpenses,
        filteredTransactions,
        dashboardStats,
        finalSettlementData,
        refreshData,
        addIncome,
        addExpense,
        recordPayment,
        transferFunds,
        saveBudget,
        deleteBudget,
        addCategory,
        updateCategory,
        deleteCategory,
        addAccount,
        updateSettings,
        loading,
        submitting,
        isBackendConnected,
        lastSyncedAt,
        syncError,
        isSyncing
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
