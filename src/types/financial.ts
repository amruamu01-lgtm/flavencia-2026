// FLAVENCIA 2026 - Financial Type Definitions

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD' | 'OTHER';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY PAID' | 'PAID';

export type TransactionType = 'INCOME' | 'EXPENSE_PAYMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT_CREDIT' | 'ADJUSTMENT_DEBIT';

export type TransactionDirection = 'CREDIT' | 'DEBIT';

export type CategoryType = 'INCOME' | 'EXPENSE';

export type AccountType = 'CASH' | 'BANK' | 'UPI' | 'OTHER';

export interface SettingItem {
  settingKey: string;
  settingValue: string;
  updatedAt: string;
}

export interface IncomeRecord {
  incomeId: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  sourceName: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  receivedBy: string;
  referenceNumber: string;
  receiptUrl: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  expenseId: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  itemName: string;
  description: string;
  vendorName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  paidBy: string;
  billUrl: string;
  paymentStatus: PaymentStatus;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePaymentRecord {
  paymentId: string;
  expenseId: string;
  paymentDate: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: PaymentMethod;
  accountId: string;
  referenceNumber: string;
  remarks: string;
  createdAt: string;
}

export interface TransactionRecord {
  transactionId: string;
  transactionDate: string; // YYYY-MM-DD
  transactionType: TransactionType;
  referenceId: string;
  accountId: string;
  amount: number;
  direction: TransactionDirection;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  // Computed for view
  accountName?: string;
  runningBalance?: number;
}

export interface CategoryRecord {
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface AccountRecord {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  isActive: boolean;
  createdAt: string;
  // Computed values
  totalCredits?: number;
  totalDebits?: number;
  currentBalance?: number;
}

export interface TransferRecord {
  transferId: string;
  transferDate: string; // YYYY-MM-DD
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  referenceNumber: string;
  description: string;
  createdAt: string;
  fromAccountName?: string;
  toAccountName?: string;
}

export interface BudgetRecord {
  budgetId: string;
  categoryId: string;
  budgetAmount: number;
  period: string; // e.g. "FLAVENCIA 2026"
  createdAt: string;
  updatedAt: string;
  // Computed values
  categoryName?: string;
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  status?: 'NORMAL' | 'WARNING' | 'EXCEEDED';
}

export interface AuditLogRecord {
  logId: string;
  actionType: string;
  module: string;
  recordId: string;
  oldValue: string;
  newValue: string;
  performedBy: string;
  timestamp: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalPaidExpenses: number;
  netAvailableBalance: number;
  cashInHand: number;
  bankBalance: number;
  upiBalance: number;
  outstandingExpenses: number;
  totalTransactions: number;
  todayIncome: number;
  todayExpenses: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  totalDonations: number;
  totalSponsorships: number;
  highestExpenseCategory: { name: string; amount: number } | null;
  totalUnpaidExpensesCount: number;
}

export interface DateFilterOption {
  key: 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'PREVIOUS_MONTH' | 'ALL_TIME' | 'CUSTOM';
  label: string;
  startDate?: string;
  endDate?: string;
}

export interface FinalSettlementData {
  festivalName: string;
  festivalYear: string;
  tagline: string;
  preparedDate: string;
  // Income
  donationsIncome: number;
  sponsorshipIncome: number;
  registrationIncome: number;
  otherIncome: number;
  grandTotalIncome: number;
  incomeByCategory: { categoryName: string; amount: number }[];
  // Expense
  stageAndSoundPaid: number;
  foodAndCateringPaid: number;
  printingPaid: number;
  transportationPaid: number;
  giftsPaid: number;
  otherExpensesPaid: number;
  grandTotalPaidExpenses: number;
  expensesByCategory: { categoryName: string; amount: number }[];
  // Outstanding
  unpaidExpensesTotal: number;
  partiallyPaidExpensesTotal: number;
  totalOutstandingAmount: number;
  // Balances
  netAvailableBalance: number;
  cashInHand: number;
  bankBalance: number;
  upiBalance: number;
  otherBalance: number;
  accountsBreakdown: { accountName: string; balance: number }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  summary?: any;
}
