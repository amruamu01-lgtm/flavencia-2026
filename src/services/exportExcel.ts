// FLAVENCIA 2026 - Excel Generation Engine using Dynamic SheetJS (xlsx)

import {
  IncomeRecord,
  ExpenseRecord,
  ExpensePaymentRecord,
  TransactionRecord,
  AccountRecord,
  BudgetRecord,
  TransferRecord
} from '../types/financial';
import { formatDate } from '../utils/formatters';

async function getXlsx() {
  const xlsxModule = await import('xlsx');
  return xlsxModule;
}

export async function exportIncomeToExcel(incomes: IncomeRecord[], fileName: string = 'FLAVENCIA_2026_Income'): Promise<void> {
  const XLSX = await getXlsx();
  const data = incomes.map(item => ({
    'Income ID': item.incomeId,
    'Date (DD/MM/YYYY)': formatDate(item.date),
    'Category ID': item.categoryId,
    'Source / Received From': item.sourceName,
    'Description': item.description,
    'Amount (₹)': item.amount,
    'Payment Method': item.paymentMethod,
    'Account ID': item.accountId,
    'Received By': item.receivedBy,
    'Reference Number': item.referenceNumber,
    'Receipt URL': item.receiptUrl,
    'Remarks': item.remarks,
    'Created At': item.createdAt
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Income');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
}

export async function exportExpensesToExcel(expenses: ExpenseRecord[], fileName: string = 'FLAVENCIA_2026_Expenses'): Promise<void> {
  const XLSX = await getXlsx();
  const data = expenses.map(item => ({
    'Expense ID': item.expenseId,
    'Date (DD/MM/YYYY)': formatDate(item.date),
    'Category ID': item.categoryId,
    'Item / Purpose': item.itemName,
    'Description': item.description,
    'Vendor / Paid To': item.vendorName,
    'Total Amount (₹)': item.totalAmount,
    'Paid Amount (₹)': item.paidAmount,
    'Balance Amount (₹)': item.balanceAmount,
    'Payment Status': item.paymentStatus,
    'Payment Method': item.paymentMethod,
    'Account ID': item.accountId,
    'Paid By': item.paidBy,
    'Bill URL': item.billUrl,
    'Remarks': item.remarks,
    'Created At': item.createdAt
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
}

export async function exportTransactionsToExcel(transactions: TransactionRecord[], fileName: string = 'FLAVENCIA_2026_Transactions'): Promise<void> {
  const XLSX = await getXlsx();
  const data = transactions.map(item => ({
    'Transaction ID': item.transactionId,
    'Date (DD/MM/YYYY)': formatDate(item.transactionDate),
    'Transaction Type': item.transactionType,
    'Reference ID': item.referenceId,
    'Account ID': item.accountId,
    'Account Name': item.accountName || item.accountId,
    'Direction': item.direction,
    'Amount (₹)': item.amount,
    'Description': item.description,
    'Payment Method': item.paymentMethod,
    'Running Balance (₹)': item.runningBalance || 0,
    'Created At': item.createdAt
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
}

export async function exportFullFestivalWorkbook(
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  payments: ExpensePaymentRecord[],
  transactions: TransactionRecord[],
  accounts: AccountRecord[],
  budgets: BudgetRecord[],
  transfers: TransferRecord[]
): Promise<void> {
  const XLSX = await getXlsx();
  const wb = XLSX.utils.book_new();

  // 1. Accounts Summary
  const accData = accounts.map(a => ({
    'Account ID': a.accountId,
    'Account Name': a.accountName,
    'Account Type': a.accountType,
    'Opening Balance (₹)': a.openingBalance,
    'Total Credits (₹)': a.totalCredits || 0,
    'Total Debits (₹)': a.totalDebits || 0,
    'Current Balance (₹)': a.currentBalance || 0
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(accData), 'Accounts');

  // 2. Income
  const incData = incomes.map(i => ({
    'Income ID': i.incomeId,
    'Date': formatDate(i.date),
    'Source': i.sourceName,
    'Description': i.description,
    'Amount (₹)': i.amount,
    'Method': i.paymentMethod,
    'Account': i.accountId,
    'Received By': i.receivedBy
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incData), 'Income');

  // 3. Expenses
  const expData = expenses.map(e => ({
    'Expense ID': e.expenseId,
    'Date': formatDate(e.date),
    'Item': e.itemName,
    'Vendor': e.vendorName,
    'Total (₹)': e.totalAmount,
    'Paid (₹)': e.paidAmount,
    'Balance (₹)': e.balanceAmount,
    'Status': e.paymentStatus,
    'Paid By': e.paidBy
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expData), 'Expenses');

  // 4. Payments
  const payData = payments.map(p => ({
    'Payment ID': p.paymentId,
    'Expense ID': p.expenseId,
    'Date': formatDate(p.paymentDate),
    'Amount (₹)': p.amount,
    'Method': p.paymentMethod,
    'Account': p.accountId,
    'Reference': p.referenceNumber
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payData), 'Payments');

  // 5. Transactions
  const txnData = transactions.map(t => ({
    'Txn ID': t.transactionId,
    'Date': formatDate(t.transactionDate),
    'Type': t.transactionType,
    'Account': t.accountId,
    'Direction': t.direction,
    'Amount (₹)': t.amount,
    'Description': t.description
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txnData), 'Transactions');

  // 6. Transfers
  const trfData = transfers.map(t => ({
    'Transfer ID': t.transferId,
    'Date': formatDate(t.transferDate),
    'From Account': t.fromAccountId,
    'To Account': t.toAccountId,
    'Amount (₹)': t.amount,
    'Description': t.description
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trfData), 'Transfers');

  // 7. Budgets
  const bdgData = budgets.map(b => ({
    'Budget ID': b.budgetId,
    'Category': b.categoryName || b.categoryId,
    'Budget (₹)': b.budgetAmount,
    'Actual Paid (₹)': b.spentAmount || 0,
    'Remaining (₹)': b.remainingAmount || 0,
    'Utilization %': b.utilizationPercentage ? `${b.utilizationPercentage.toFixed(1)}%` : '0%'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bdgData), 'Budgets');

  XLSX.writeFile(wb, `FLAVENCIA_2026_Complete_Financial_Statement_${Date.now()}.xlsx`);
}
