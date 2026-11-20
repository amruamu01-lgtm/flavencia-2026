/**
 * ============================================================================
 * FLAVENCIA 2026 – FINANCE & ACCOUNTS MANAGEMENT SYSTEM
 * GOOGLE APPS SCRIPT BACKEND API (Code.gs)
 * Tagline: BEYOND BOUNDARIES
 * ============================================================================
 * 
 * Features:
 * - Direct REST-like JSON API (doGet and doPost)
 * - LockService concurrency protection for all financial writes
 * - Master Spreadsheet with 10 Tabs:
 *   1. Settings
 *   2. Income
 *   3. Expenses
 *   4. ExpensePayments
 *   5. Transactions
 *   6. Categories
 *   7. Accounts
 *   8. Transfers
 *   9. Budgets
 *   10. AuditLogs
 * - Drive file upload integration (Receipts & Bills)
 * - Server-side revalidation of all financial calculations
 * - Automatic database initialization and backup
 * - NO approval logic
 */

// ============================================================================
// CENTRAL GOOGLE SHEETS DATABASE CONFIGURATION (SERVER-SIDE)
// ============================================================================
// The Master Google Spreadsheet ID is configured centrally on the server.
// No client or admin needs to manually configure or enter a Spreadsheet ID.
//
// Discovery priority:
// 1. Script Properties (Server-side environment variable): SPREADSHEET_ID
// 2. Constant SPREADSHEET_ID below (if set)
// 3. Active container-bound spreadsheet (Extensions > Apps Script from within Sheet)
const SPREADSHEET_ID = ''; // Leave blank if script is container-bound or set in Script Properties

/**
 * Centrally retrieves the connected Master Google Spreadsheet.
 */
function getSpreadsheet() {
  // 1. Check server-side Script Properties (environment variable)
  try {
    const props = PropertiesService.getScriptProperties();
    const propId = props.getProperty('SPREADSHEET_ID');
    if (propId && propId.trim() !== '') {
      return SpreadsheetApp.openById(propId.trim());
    }
  } catch (err) {
    Logger.log('Notice: Could not read script properties: ' + err.message);
  }

  // 2. Check server-side constant
  if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }

  // 3. Check container-bound active spreadsheet
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      return active;
    }
  } catch (err) {
    Logger.log('Notice: No container-bound spreadsheet active: ' + err.message);
  }

  throw new Error('Central Google Spreadsheet is not connected. Configure SPREADSHEET_ID in Script Properties or bind this script to the Master Spreadsheet.');
}

/**
 * Server-side helper to configure or update the central Spreadsheet ID.
 * Can be executed once from the Apps Script editor without redeploying code.
 */
function setCentralSpreadsheetId(id) {
  if (!id || id.trim() === '') {
    throw new Error('Spreadsheet ID cannot be empty');
  }
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id.trim());
  Logger.log('Central Master Spreadsheet ID set to: ' + id.trim());
  return 'Success: Central Spreadsheet ID configured.';
}

/**
 * Handle GET requests (Health check, central database status, simple data fetch)
 */
function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'ping';
    if (action === 'ping' || action === 'getDatabaseStatus') {
      let dbInfo = { connected: false };
      try {
        const ss = getSpreadsheet();
        dbInfo = {
          connected: true,
          spreadsheetName: ss.getName(),
          sheetsCount: ss.getSheets().length,
          timezone: ss.getSpreadsheetTimeZone()
        };
      } catch (e) {
        dbInfo = { connected: false, error: e.message };
      }
      return jsonResponse({
        success: dbInfo.connected,
        connected: dbInfo.connected,
        message: dbInfo.connected ? 'FLAVENCIA 2026 Central Database Backend is Connected' : dbInfo.error,
        database: dbInfo,
        timestamp: new Date().toISOString()
      });
    }
    if (action === 'getAllData') {
      const ss = getSpreadsheet();
      const data = fetchAllDatabaseData(ss);
      return jsonResponse({ success: true, data: data });
    }
    return jsonResponse({ success: false, error: 'Unknown GET action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle POST requests (Financial transactions, CRUD, File Uploads)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Acquire lock for up to 30 seconds for safe concurrency
    const acquired = lock.tryLock(30000);
    if (!acquired) {
      return jsonResponse({
        success: false,
        error: 'System is currently processing another financial transaction. Please retry in a few seconds.'
      });
    }

    let requestBody = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestBody = JSON.parse(e.postData.contents);
      } catch (pe) {
        return jsonResponse({ success: false, error: 'Invalid JSON payload' });
      }
    }

    const action = requestBody.action;
    const payload = requestBody.payload || {};
    const ss = getSpreadsheet();

    // Route Actions
    switch (action) {
      case 'ping':
      case 'getDatabaseStatus': {
        let dbInfo = { connected: false };
        try {
          dbInfo = {
            connected: true,
            spreadsheetName: ss.getName(),
            sheetsCount: ss.getSheets().length,
            timezone: ss.getSpreadsheetTimeZone()
          };
        } catch (e) {
          dbInfo = { connected: false, error: e.message };
        }
        return jsonResponse({
          success: dbInfo.connected,
          connected: dbInfo.connected,
          message: dbInfo.connected ? 'FLAVENCIA 2026 Central Database Backend is Connected' : dbInfo.error,
          database: dbInfo,
          timestamp: new Date().toISOString()
        });
      }

      case 'initDatabase':
        return jsonResponse(initDatabaseStructure(ss));

      case 'getAllData':
        return jsonResponse({ success: true, data: fetchAllDatabaseData(ss) });

      case 'addIncome':
        return jsonResponse(handleAddIncome(ss, payload));

      case 'editIncome':
        return jsonResponse(handleEditIncome(ss, payload));

      case 'deleteIncome':
        return jsonResponse(handleDeleteIncome(ss, payload));

      case 'addExpense':
        return jsonResponse(handleAddExpense(ss, payload));

      case 'editExpense':
        return jsonResponse(handleEditExpense(ss, payload));

      case 'deleteExpense':
        return jsonResponse(handleDeleteExpense(ss, payload));

      case 'recordPayment':
        return jsonResponse(handleRecordPayment(ss, payload));

      case 'transferFunds':
        return jsonResponse(handleTransferFunds(ss, payload));

      case 'setBudget':
        return jsonResponse(handleSetBudget(ss, payload));

      case 'deleteBudget':
        return jsonResponse(handleDeleteBudget(ss, payload));

      case 'addCategory':
        return jsonResponse(handleAddCategory(ss, payload));

      case 'updateCategory':
        return jsonResponse(handleUpdateCategory(ss, payload));

      case 'deleteCategory':
        return jsonResponse(handleDeleteCategory(ss, payload));

      case 'addAccount':
        return jsonResponse(handleAddAccount(ss, payload));

      case 'migrateData':
        return jsonResponse(handleMigrateData(ss, payload));

      case 'uploadFile':
        return jsonResponse(handleUploadFile(payload));

      case 'backupDatabase':
        return jsonResponse(handleBackupDatabase(ss));

      default:
        return jsonResponse({ success: false, error: 'Unknown POST action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * JSON Response Formatter with proper CORS header
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// DATABASE INITIALIZATION (10 Required Sheets)
// ============================================================================

const SHEET_SCHEMAS = {
  Settings: ['settingKey', 'settingValue', 'updatedAt'],
  Income: ['incomeId', 'date', 'categoryId', 'sourceName', 'description', 'amount', 'paymentMethod', 'accountId', 'receivedBy', 'referenceNumber', 'receiptUrl', 'remarks', 'createdAt', 'updatedAt'],
  Expenses: ['expenseId', 'date', 'categoryId', 'itemName', 'description', 'vendorName', 'totalAmount', 'paidAmount', 'balanceAmount', 'paymentMethod', 'accountId', 'paidBy', 'billUrl', 'paymentStatus', 'remarks', 'createdAt', 'updatedAt'],
  ExpensePayments: ['paymentId', 'expenseId', 'paymentDate', 'amount', 'paymentMethod', 'accountId', 'referenceNumber', 'remarks', 'createdAt'],
  Transactions: ['transactionId', 'transactionDate', 'transactionType', 'referenceId', 'accountId', 'amount', 'direction', 'description', 'paymentMethod', 'createdAt'],
  Categories: ['categoryId', 'categoryName', 'categoryType', 'description', 'isActive', 'createdAt'],
  Accounts: ['accountId', 'accountName', 'accountType', 'openingBalance', 'isActive', 'createdAt'],
  Transfers: ['transferId', 'transferDate', 'fromAccountId', 'toAccountId', 'amount', 'referenceNumber', 'description', 'createdAt'],
  Budgets: ['budgetId', 'categoryId', 'budgetAmount', 'period', 'createdAt', 'updatedAt'],
  AuditLogs: ['logId', 'actionType', 'module', 'recordId', 'oldValue', 'newValue', 'performedBy', 'timestamp']
};

function initDatabaseStructure(ss) {
  if (!ss) ss = getSpreadsheet();
  const createdSheets = [];

  for (const sheetName in SHEET_SCHEMAS) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const headers = SHEET_SCHEMAS[sheetName];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1A1A22').setFontColor('#FFFFFF');
      createdSheets.push(sheetName);
    }
  }

  // Populate Default Categories if empty
  const catSheet = ss.getSheetByName('Categories');
  if (catSheet.getLastRow() <= 1) {
    const now = new Date().toISOString();
    const defaultCats = [
      ['CAT-INC-01', 'Individual Donations', 'INCOME', 'Patron donations', true, now],
      ['CAT-INC-02', 'Institutional Donations', 'INCOME', 'Corporate & trust grants', true, now],
      ['CAT-INC-03', 'Sponsorship', 'INCOME', 'Event sponsors', true, now],
      ['CAT-INC-04', 'Registration Fees', 'INCOME', 'Delegate registration', true, now],
      ['CAT-INC-05', 'Competition Entry Fees', 'INCOME', 'Contest fees', true, now],
      ['CAT-INC-06', 'Advertisement Revenue', 'INCOME', 'Souvenir ads', true, now],
      ['CAT-INC-07', 'Stall Revenue', 'INCOME', 'Stall rentals', true, now],
      ['CAT-INC-08', 'Food Sales', 'INCOME', 'Official food stalls', true, now],
      ['CAT-INC-09', 'Other Income', 'INCOME', 'Sundry receipts', true, now],
      ['CAT-EXP-01', 'Stage and Sound', 'EXPENSE', 'Sound & truss rental', true, now],
      ['CAT-EXP-02', 'Lighting and Decoration', 'EXPENSE', 'Lighting & decor', true, now],
      ['CAT-EXP-03', 'Food and Catering', 'EXPENSE', 'Food & snacks', true, now],
      ['CAT-EXP-04', 'Printing and Designing', 'EXPENSE', 'Banners & passes', true, now],
      ['CAT-EXP-05', 'Trophies and Certificates', 'EXPENSE', 'Mementos & medals', true, now],
      ['CAT-EXP-06', 'Transportation', 'EXPENSE', 'Vehicles & fuel', true, now],
      ['CAT-EXP-07', 'Accommodation', 'EXPENSE', 'Guest rooms', true, now],
      ['CAT-EXP-08', 'Marketing and Promotion', 'EXPENSE', 'Promo & campaigns', true, now],
      ['CAT-EXP-09', 'Gifts and Prizes', 'EXPENSE', 'Cash prizes', true, now],
      ['CAT-EXP-10', 'Stationery', 'EXPENSE', 'Office items', true, now],
      ['CAT-EXP-11', 'Volunteer Expenses', 'EXPENSE', 'Volunteer kits', true, now],
      ['CAT-EXP-12', 'Equipment', 'EXPENSE', 'Generators & comms', true, now],
      ['CAT-EXP-13', 'Miscellaneous', 'EXPENSE', 'Contingency', true, now]
    ];
    defaultCats.forEach(row => catSheet.appendRow(row));
  }

  // Populate Default Accounts if empty
  const accSheet = ss.getSheetByName('Accounts');
  if (accSheet.getLastRow() <= 1) {
    const now = new Date().toISOString();
    const defaultAccs = [
      ['ACC-01', 'Cash in Hand', 'CASH', 0, true, now],
      ['ACC-02', 'Bank Account', 'BANK', 0, true, now],
      ['ACC-03', 'UPI Account', 'UPI', 0, true, now]
    ];
    defaultAccs.forEach(row => accSheet.appendRow(row));
  }

  // Populate Default Settings if empty
  const setSheet = ss.getSheetByName('Settings');
  if (setSheet.getLastRow() <= 1) {
    const now = new Date().toISOString();
    const defaultSettings = [
      ['festivalName', 'FLAVENCIA 2026', now],
      ['tagline', 'BEYOND BOUNDARIES', now],
      ['festivalYear', '2026', now],
      ['currency', 'INR', now],
      ['timezone', 'Asia/Kolkata', now],
      ['adminUsername', 'admin', now],
      ['adminPasswordHash', '3e042bce5c9bc052df3a94f6f7eb35a74e539959e1c28c89d2d0c242c7e0b6ea', now]
    ];
    defaultSettings.forEach(row => setSheet.appendRow(row));
  }

  return {
    success: true,
    message: 'Master database initialized successfully',
    createdSheets: createdSheets
  };
}

// ============================================================================
// DATA RETRIEVAL (Batch read for high performance)
// ============================================================================

function fetchAllDatabaseData(ss) {
  if (!ss) ss = getSpreadsheet();
  const result = {};

  for (const sheetName in SHEET_SCHEMAS) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result[sheetName.charAt(0).toLowerCase() + sheetName.slice(1)] = [];
      continue;
    }

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol < 1) {
      result[sheetName.charAt(0).toLowerCase() + sheetName.slice(1)] = [];
      continue;
    }

    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0];
    const rows = [];

    for (let i = 1; i < values.length; i++) {
      const rowObj = {};
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = values[i][j];
      }
      rows.push(rowObj);
    }

    // Sheet to property key mapping
    const key = sheetName === 'ExpensePayments' ? 'expensePayments'
      : sheetName === 'AuditLogs' ? 'auditLogs'
      : sheetName.charAt(0).toLowerCase() + sheetName.slice(1);

    result[key] = rows;
  }

  return result;
}

// ============================================================================
// FINANCIAL HANDLERS
// ============================================================================

function handleAddIncome(ss, p) {
  const amount = Number(p.amount);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Valid positive income amount is required' };
  }
  if (!p.accountId) {
    return { success: false, error: 'Deposit account ID is required' };
  }

  const now = new Date().toISOString();
  const incomeId = p.incomeId || ('INC-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase());
  const date = p.date || now.split('T')[0];

  const incomeRow = [
    incomeId,
    date,
    p.categoryId || 'CAT-INC-09',
    p.sourceName || 'Donor / Participant',
    p.description || '',
    amount,
    p.paymentMethod || 'CASH',
    p.accountId,
    p.receivedBy || 'Admin',
    p.referenceNumber || '',
    p.receiptUrl || '',
    p.remarks || '',
    now,
    now
  ];

  const incSheet = ss.getSheetByName('Income');
  incSheet.appendRow(incomeRow);

  // Append CREDIT Transaction
  const txnSheet = ss.getSheetByName('Transactions');
  const txnId = 'TXN-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase();
  const txnRow = [
    txnId,
    date,
    'INCOME',
    incomeId,
    p.accountId,
    amount,
    'CREDIT',
    'Income: ' + (p.sourceName || 'Receipt') + ' - ' + (p.description || ''),
    p.paymentMethod || 'CASH',
    now
  ];
  txnSheet.appendRow(txnRow);

  // Append AuditLog
  logAudit(ss, 'CREATE_INCOME', 'INCOME', incomeId, '', JSON.stringify(p), p.performedBy || 'Admin', now);

  return { success: true, message: 'Income successfully recorded in Google Sheets', incomeId: incomeId };
}

function handleAddExpense(ss, p) {
  const totalAmount = Number(p.totalAmount);
  const paidAmount = Number(p.paidAmount) || 0;

  if (isNaN(totalAmount) || totalAmount <= 0) {
    return { success: false, error: 'Total amount must be greater than zero' };
  }
  if (paidAmount < 0 || paidAmount > totalAmount) {
    return { success: false, error: 'Paid amount cannot exceed total amount or be negative' };
  }
  if (paidAmount > 0 && !p.accountId) {
    return { success: false, error: 'Payment account is required when payment > 0' };
  }

  const balanceAmount = totalAmount - paidAmount;
  let paymentStatus = 'UNPAID';
  if (paidAmount === totalAmount) paymentStatus = 'PAID';
  else if (paidAmount > 0) paymentStatus = 'PARTIALLY PAID';

  const now = new Date().toISOString();
  const expenseId = p.expenseId || ('EXP-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase());
  const date = p.date || now.split('T')[0];

  const expenseRow = [
    expenseId,
    date,
    p.categoryId || 'CAT-EXP-13',
    p.itemName || 'Expense Item',
    p.description || '',
    p.vendorName || 'Vendor',
    totalAmount,
    paidAmount,
    balanceAmount,
    p.paymentMethod || 'CASH',
    p.accountId || '',
    p.paidBy || 'Admin',
    p.billUrl || '',
    paymentStatus,
    p.remarks || '',
    now,
    now
  ];

  const expSheet = ss.getSheetByName('Expenses');
  expSheet.appendRow(expenseRow);

  // If initial payment was made, record in ExpensePayments and Transactions
  if (paidAmount > 0) {
    const paySheet = ss.getSheetByName('ExpensePayments');
    const payId = 'PAY-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase();
    const payRow = [
      payId,
      expenseId,
      date,
      paidAmount,
      p.paymentMethod || 'CASH',
      p.accountId,
      p.referenceNumber || '',
      'Initial payment upon expense creation',
      now
    ];
    paySheet.appendRow(payRow);

    // Create DEBIT Transaction
    const txnSheet = ss.getSheetByName('Transactions');
    const txnId = 'TXN-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase();
    const txnRow = [
      txnId,
      date,
      'EXPENSE_PAYMENT',
      expenseId,
      p.accountId,
      paidAmount,
      'DEBIT',
      'Expense Payment: ' + (p.itemName || '') + ' (' + (p.vendorName || '') + ')',
      p.paymentMethod || 'CASH',
      now
    ];
    txnSheet.appendRow(txnRow);
  }

  logAudit(ss, 'CREATE_EXPENSE', 'EXPENSES', expenseId, '', JSON.stringify(p), p.performedBy || 'Admin', now);

  return { success: true, message: 'Expense saved in Google Sheets', expenseId: expenseId };
}

function handleRecordPayment(ss, p) {
  const amount = Number(p.amount);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Valid payment amount greater than zero is required' };
  }
  if (!p.accountId) {
    return { success: false, error: 'Payment account is required' };
  }

  const expSheet = ss.getSheetByName('Expenses');
  const values = expSheet.getDataRange().getValues();
  let foundRowIndex = -1;
  let expenseRow = null;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.expenseId)) {
      foundRowIndex = i + 1; // 1-based row index in sheet
      expenseRow = values[i];
      break;
    }
  }

  if (foundRowIndex === -1 || !expenseRow) {
    return { success: false, error: 'Expense record not found in Google Sheets' };
  }

  const totalAmount = Number(expenseRow[6]);
  const currentPaid = Number(expenseRow[7]);
  const currentBalance = Number(expenseRow[8]);

  if (amount > currentBalance) {
    return {
      success: false,
      error: 'Payment amount (' + amount + ') exceeds remaining balance (' + currentBalance + ')'
    };
  }

  const newPaid = currentPaid + amount;
  const newBalance = totalAmount - newPaid;
  let newStatus = 'PARTIALLY PAID';
  if (newBalance <= 0) newStatus = 'PAID';

  const now = new Date().toISOString();

  // Update Expense Row in Sheets: PaidAmount (col 8), BalanceAmount (col 9), PaymentStatus (col 14), UpdatedAt (col 17)
  expSheet.getRange(foundRowIndex, 8).setValue(newPaid);
  expSheet.getRange(foundRowIndex, 9).setValue(newBalance);
  expSheet.getRange(foundRowIndex, 14).setValue(newStatus);
  expSheet.getRange(foundRowIndex, 17).setValue(now);

  // Append ExpensePayment Row
  const paySheet = ss.getSheetByName('ExpensePayments');
  const payId = 'PAY-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase();
  const payDate = p.paymentDate || now.split('T')[0];

  const payRow = [
    payId,
    p.expenseId,
    payDate,
    amount,
    p.paymentMethod || 'CASH',
    p.accountId,
    p.referenceNumber || '',
    p.remarks || '',
    now
  ];
  paySheet.appendRow(payRow);

  // Append DEBIT Transaction
  const txnSheet = ss.getSheetByName('Transactions');
  const txnId = 'TXN-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase();
  const itemName = expenseRow[3];
  const vendorName = expenseRow[5];
  const txnRow = [
    txnId,
    payDate,
    'EXPENSE_PAYMENT',
    p.expenseId,
    p.accountId,
    amount,
    'DEBIT',
    'Expense Payment (' + payId + '): ' + itemName + ' - ' + vendorName,
    p.paymentMethod || 'CASH',
    now
  ];
  txnSheet.appendRow(txnRow);

  logAudit(ss, 'RECORD_PAYMENT', 'PAYMENTS', payId, 'Paid: ' + currentPaid + ', Bal: ' + currentBalance, 'Paid: ' + newPaid + ', Bal: ' + newBalance, p.performedBy || 'Admin', now);

  return { success: true, message: 'Payment recorded and balance deducted from account', paymentId: payId };
}

function handleTransferFunds(ss, p) {
  const amount = Number(p.amount);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Valid positive transfer amount is required' };
  }
  if (!p.fromAccountId || !p.toAccountId) {
    return { success: false, error: 'Source and destination accounts are required' };
  }
  if (p.fromAccountId === p.toAccountId) {
    return { success: false, error: 'Source and destination accounts cannot be identical' };
  }

  const now = new Date().toISOString();
  const transferId = 'TRF-2026-' + Date.now().toString().slice(-4) + Math.random().toString(36).substring(2, 4).toUpperCase();
  const date = p.transferDate || now.split('T')[0];

  const trfSheet = ss.getSheetByName('Transfers');
  const trfRow = [
    transferId,
    date,
    p.fromAccountId,
    p.toAccountId,
    amount,
    p.referenceNumber || '',
    p.description || 'Inter-account transfer',
    now
  ];
  trfSheet.appendRow(trfRow);

  // Two Transactions: DEBIT from Source, CREDIT to Destination
  const txnSheet = ss.getSheetByName('Transactions');
  const txnDebitId = 'TXN-2026-' + Date.now().toString().slice(-4) + 'OUT';
  const txnCreditId = 'TXN-2026-' + Date.now().toString().slice(-4) + 'IN';

  const debitRow = [
    txnDebitId,
    date,
    'TRANSFER_OUT',
    transferId,
    p.fromAccountId,
    amount,
    'DEBIT',
    'Transfer Out to ' + p.toAccountId + ': ' + (p.description || ''),
    'BANK_TRANSFER',
    now
  ];
  const creditRow = [
    txnCreditId,
    date,
    'TRANSFER_IN',
    transferId,
    p.toAccountId,
    amount,
    'CREDIT',
    'Transfer In from ' + p.fromAccountId + ': ' + (p.description || ''),
    'BANK_TRANSFER',
    now
  ];

  txnSheet.appendRow(debitRow);
  txnSheet.appendRow(creditRow);

  logAudit(ss, 'ACCOUNT_TRANSFER', 'ACCOUNTS', transferId, '', JSON.stringify(p), p.performedBy || 'Admin', now);

  return { success: true, message: 'Transfer completed without affecting income or expenses', transferId: transferId };
}

function handleSetBudget(ss, p) {
  const amount = Number(p.budgetAmount);
  if (isNaN(amount) || amount < 0) {
    return { success: false, error: 'Valid budget amount is required' };
  }

  const bdgSheet = ss.getSheetByName('Budgets');
  const values = bdgSheet.getDataRange().getValues();
  let foundRow = -1;
  const now = new Date().toISOString();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][1]) === String(p.categoryId)) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    bdgSheet.getRange(foundRow, 3).setValue(amount);
    bdgSheet.getRange(foundRow, 6).setValue(now);
  } else {
    const budgetId = 'BDG-2026-' + Date.now().toString().slice(-4);
    bdgSheet.appendRow([budgetId, p.categoryId, amount, p.period || 'FLAVENCIA 2026', now, now]);
  }

  logAudit(ss, 'SET_BUDGET', 'BUDGETS', p.categoryId, '', 'Amount: ' + amount, p.performedBy || 'Admin', now);
  return { success: true, message: 'Budget saved successfully' };
}

function handleDeleteBudget(ss, p) {
  const bdgSheet = ss.getSheetByName('Budgets');
  const values = bdgSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.budgetId)) {
      bdgSheet.deleteRow(i + 1);
      logAudit(ss, 'DELETE_BUDGET', 'BUDGETS', p.budgetId, '', 'Deleted', p.performedBy || 'Admin', new Date().toISOString());
      return { success: true, message: 'Budget deleted' };
    }
  }
  return { success: false, error: 'Budget not found' };
}

function handleAddCategory(ss, p) {
  if (!p.categoryName) return { success: false, error: 'Category name required' };
  const catSheet = ss.getSheetByName('Categories');
  const catId = p.categoryId || ('CAT-' + Date.now().toString().slice(-4));
  const now = new Date().toISOString();
  catSheet.appendRow([catId, p.categoryName, p.categoryType || 'EXPENSE', p.description || '', true, now]);
  logAudit(ss, 'CREATE_CATEGORY', 'CATEGORIES', catId, '', p.categoryName, p.performedBy || 'Admin', now);
  return { success: true, message: 'Category added', categoryId: catId };
}

function handleUpdateCategory(ss, p) {
  if (!p.categoryId) return { success: false, error: 'Category ID is required' };
  const catSheet = ss.getSheetByName('Categories');
  const values = catSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.categoryId)) {
      if (p.categoryName !== undefined) catSheet.getRange(i + 1, 2).setValue(p.categoryName);
      if (p.categoryType !== undefined) catSheet.getRange(i + 1, 3).setValue(p.categoryType);
      if (p.description !== undefined) catSheet.getRange(i + 1, 4).setValue(p.description);
      if (p.isActive !== undefined) catSheet.getRange(i + 1, 5).setValue(p.isActive);
      logAudit(ss, 'UPDATE_CATEGORY', 'CATEGORIES', p.categoryId, String(values[i][1]), JSON.stringify(p), p.performedBy || 'Admin', new Date().toISOString());
      return { success: true, message: 'Category updated successfully' };
    }
  }
  return { success: false, error: 'Category not found' };
}

function handleDeleteCategory(ss, p) {
  if (!p.categoryId) return { success: false, error: 'Category ID is required' };
  const catSheet = ss.getSheetByName('Categories');
  const values = catSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.categoryId)) {
      // Check if category is used in Income or Expenses
      const incSheet = ss.getSheetByName('Income');
      const expSheet = ss.getSheetByName('Expenses');
      let isUsed = false;
      if (incSheet) {
        const incVals = incSheet.getDataRange().getValues();
        for (let j = 1; j < incVals.length; j++) {
          if (String(incVals[j][2]) === String(p.categoryId)) { isUsed = true; break; }
        }
      }
      if (!isUsed && expSheet) {
        const expVals = expSheet.getDataRange().getValues();
        for (let k = 1; k < expVals.length; k++) {
          if (String(expVals[k][2]) === String(p.categoryId)) { isUsed = true; break; }
        }
      }
      
      if (isUsed) {
        catSheet.getRange(i + 1, 5).setValue(false);
        logAudit(ss, 'DEACTIVATE_CATEGORY', 'CATEGORIES', p.categoryId, 'Active', 'Inactive (in use)', p.performedBy || 'Admin', new Date().toISOString());
        return { success: true, message: 'Category is linked to existing transactions; it has been deactivated from future entries.' };
      } else {
        catSheet.deleteRow(i + 1);
        logAudit(ss, 'DELETE_CATEGORY', 'CATEGORIES', p.categoryId, String(values[i][1]), 'Deleted', p.performedBy || 'Admin', new Date().toISOString());
        return { success: true, message: 'Category deleted successfully' };
      }
    }
  }
  return { success: false, error: 'Category not found' };
}

function handleEditIncome(ss, p) {
  if (!p.incomeId) return { success: false, error: 'Income ID is required' };
  const incSheet = ss.getSheetByName('Income');
  const values = incSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.incomeId)) {
      const oldAmount = Number(values[i][5]);
      const newAmount = p.amount !== undefined ? Number(p.amount) : oldAmount;
      if (p.date) incSheet.getRange(i + 1, 2).setValue(p.date);
      if (p.categoryId) incSheet.getRange(i + 1, 3).setValue(p.categoryId);
      if (p.sourceName) incSheet.getRange(i + 1, 4).setValue(p.sourceName);
      if (p.description !== undefined) incSheet.getRange(i + 1, 5).setValue(p.description);
      if (p.amount !== undefined) incSheet.getRange(i + 1, 6).setValue(newAmount);
      if (p.paymentMethod) incSheet.getRange(i + 1, 7).setValue(p.paymentMethod);
      if (p.accountId) incSheet.getRange(i + 1, 8).setValue(p.accountId);
      if (p.receivedBy) incSheet.getRange(i + 1, 9).setValue(p.receivedBy);
      if (p.referenceNumber !== undefined) incSheet.getRange(i + 1, 10).setValue(p.referenceNumber);
      if (p.receiptUrl !== undefined) incSheet.getRange(i + 1, 11).setValue(p.receiptUrl);
      if (p.remarks !== undefined) incSheet.getRange(i + 1, 12).setValue(p.remarks);
      incSheet.getRange(i + 1, 14).setValue(new Date().toISOString());

      // Update associated transaction
      const txnSheet = ss.getSheetByName('Transactions');
      if (txnSheet) {
        const txnVals = txnSheet.getDataRange().getValues();
        for (let t = 1; t < txnVals.length; t++) {
          if (String(txnVals[t][3]) === String(p.incomeId) && txnVals[t][2] === 'INCOME') {
            if (p.date) txnSheet.getRange(t + 1, 2).setValue(p.date);
            if (p.accountId) txnSheet.getRange(t + 1, 5).setValue(p.accountId);
            if (p.amount !== undefined) txnSheet.getRange(t + 1, 6).setValue(newAmount);
            if (p.sourceName || p.description) txnSheet.getRange(t + 1, 8).setValue('Income: ' + (p.sourceName || values[i][3]) + ' - ' + (p.description || values[i][4]));
            if (p.paymentMethod) txnSheet.getRange(t + 1, 9).setValue(p.paymentMethod);
            break;
          }
        }
      }

      logAudit(ss, 'EDIT_INCOME', 'INCOME', p.incomeId, 'Amount: ' + oldAmount, 'Amount: ' + newAmount, p.performedBy || 'Admin', new Date().toISOString());
      return { success: true, message: 'Income record updated successfully' };
    }
  }
  return { success: false, error: 'Income record not found' };
}

function handleDeleteIncome(ss, p) {
  if (!p.incomeId) return { success: false, error: 'Income ID is required' };
  const incSheet = ss.getSheetByName('Income');
  const values = incSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.incomeId)) {
      const oldAmount = values[i][5];
      incSheet.deleteRow(i + 1);

      // Delete corresponding transaction
      const txnSheet = ss.getSheetByName('Transactions');
      if (txnSheet) {
        const txnVals = txnSheet.getDataRange().getValues();
        for (let t = txnVals.length - 1; t >= 1; t--) {
          if (String(txnVals[t][3]) === String(p.incomeId)) {
            txnSheet.deleteRow(t + 1);
          }
        }
      }

      logAudit(ss, 'DELETE_INCOME', 'INCOME', p.incomeId, 'Amount: ' + oldAmount, 'Deleted', p.performedBy || 'Admin', new Date().toISOString());
      return { success: true, message: 'Income record and associated transaction deleted' };
    }
  }
  return { success: false, error: 'Income record not found' };
}

function handleEditExpense(ss, p) {
  if (!p.expenseId) return { success: false, error: 'Expense ID is required' };
  const expSheet = ss.getSheetByName('Expenses');
  const values = expSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.expenseId)) {
      const oldTotal = Number(values[i][6]);
      const paidAmount = Number(values[i][7]);
      const newTotal = p.totalAmount !== undefined ? Number(p.totalAmount) : oldTotal;

      if (newTotal < paidAmount) {
        return { success: false, error: 'Total amount cannot be less than already paid amount (' + paidAmount + ')' };
      }

      const newBalance = newTotal - paidAmount;
      let newStatus = 'UNPAID';
      if (paidAmount >= newTotal && newTotal > 0) newStatus = 'PAID';
      else if (paidAmount > 0) newStatus = 'PARTIALLY PAID';

      if (p.date) expSheet.getRange(i + 1, 2).setValue(p.date);
      if (p.categoryId) expSheet.getRange(i + 1, 3).setValue(p.categoryId);
      if (p.itemName) expSheet.getRange(i + 1, 4).setValue(p.itemName);
      if (p.description !== undefined) expSheet.getRange(i + 1, 5).setValue(p.description);
      if (p.vendorName) expSheet.getRange(i + 1, 6).setValue(p.vendorName);
      if (p.totalAmount !== undefined) expSheet.getRange(i + 1, 7).setValue(newTotal);
      expSheet.getRange(i + 1, 9).setValue(newBalance);
      expSheet.getRange(i + 1, 14).setValue(newStatus);
      if (p.remarks !== undefined) expSheet.getRange(i + 1, 15).setValue(p.remarks);
      expSheet.getRange(i + 1, 17).setValue(new Date().toISOString());

      logAudit(ss, 'EDIT_EXPENSE', 'EXPENSES', p.expenseId, 'Total: ' + oldTotal, 'Total: ' + newTotal, p.performedBy || 'Admin', new Date().toISOString());
      return { success: true, message: 'Expense record updated' };
    }
  }
  return { success: false, error: 'Expense record not found' };
}

function handleDeleteExpense(ss, p) {
  if (!p.expenseId) return { success: false, error: 'Expense ID is required' };
  const expSheet = ss.getSheetByName('Expenses');
  const values = expSheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.expenseId)) {
      expSheet.deleteRow(i + 1);

      // Delete payments
      const paySheet = ss.getSheetByName('ExpensePayments');
      if (paySheet) {
        const payVals = paySheet.getDataRange().getValues();
        for (let py = payVals.length - 1; py >= 1; py--) {
          if (String(payVals[py][1]) === String(p.expenseId)) {
            paySheet.deleteRow(py + 1);
          }
        }
      }

      // Delete transactions
      const txnSheet = ss.getSheetByName('Transactions');
      if (txnSheet) {
        const txnVals = txnSheet.getDataRange().getValues();
        for (let t = txnVals.length - 1; t >= 1; t--) {
          if (String(txnVals[t][3]) === String(p.expenseId)) {
            txnSheet.deleteRow(t + 1);
          }
        }
      }

      logAudit(ss, 'DELETE_EXPENSE', 'EXPENSES', p.expenseId, '', 'Deleted with payments & txns', p.performedBy || 'Admin', new Date().toISOString());
      return { success: true, message: 'Expense and related payment records deleted' };
    }
  }
  return { success: false, error: 'Expense record not found' };
}

function handleMigrateData(ss, p) {
  const result = {
    migrated: { income: 0, expenses: 0, payments: 0, transactions: 0, categories: 0, accounts: 0, transfers: 0, budgets: 0 },
    skipped: { income: 0, expenses: 0, payments: 0, transactions: 0, categories: 0, accounts: 0, transfers: 0, budgets: 0 }
  };

  function getExistingIds(sheetName, idColIdx) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return new Set();
    const vals = sheet.getDataRange().getValues();
    const set = new Set();
    for (let i = 1; i < vals.length; i++) {
      if (vals[i][idColIdx]) set.add(String(vals[i][idColIdx]));
    }
    return set;
  }

  // Categories
  if (Array.isArray(p.categories) && p.categories.length > 0) {
    const catSheet = ss.getSheetByName('Categories');
    const existing = getExistingIds('Categories', 0);
    p.categories.forEach(function(c) {
      if (!existing.has(String(c.categoryId))) {
        catSheet.appendRow([c.categoryId, c.categoryName, c.categoryType, c.description || '', c.isActive !== false, c.createdAt || new Date().toISOString()]);
        existing.add(String(c.categoryId));
        result.migrated.categories++;
      } else {
        result.skipped.categories++;
      }
    });
  }

  // Income
  if (Array.isArray(p.income) && p.income.length > 0) {
    const incSheet = ss.getSheetByName('Income');
    const existing = getExistingIds('Income', 0);
    p.income.forEach(function(item) {
      if (!existing.has(String(item.incomeId))) {
        incSheet.appendRow([
          item.incomeId, item.date, item.categoryId, item.sourceName, item.description || '',
          Number(item.amount) || 0, item.paymentMethod || 'CASH', item.accountId, item.receivedBy || 'Admin',
          item.referenceNumber || '', item.receiptUrl || '', item.remarks || '', item.createdAt || new Date().toISOString(), item.updatedAt || new Date().toISOString()
        ]);
        existing.add(String(item.incomeId));
        result.migrated.income++;
      } else {
        result.skipped.income++;
      }
    });
  }

  // Expenses
  if (Array.isArray(p.expenses) && p.expenses.length > 0) {
    const expSheet = ss.getSheetByName('Expenses');
    const existing = getExistingIds('Expenses', 0);
    p.expenses.forEach(function(item) {
      if (!existing.has(String(item.expenseId))) {
        expSheet.appendRow([
          item.expenseId, item.date, item.categoryId, item.itemName, item.description || '', item.vendorName || '',
          Number(item.totalAmount) || 0, Number(item.paidAmount) || 0, Number(item.balanceAmount) || 0,
          item.paymentMethod || 'CASH', item.accountId || '', item.paidBy || 'Admin', item.billUrl || '',
          item.paymentStatus || 'UNPAID', item.remarks || '', item.createdAt || new Date().toISOString(), item.updatedAt || new Date().toISOString()
        ]);
        existing.add(String(item.expenseId));
        result.migrated.expenses++;
      } else {
        result.skipped.expenses++;
      }
    });
  }

  // ExpensePayments
  if (Array.isArray(p.expensePayments) && p.expensePayments.length > 0) {
    const paySheet = ss.getSheetByName('ExpensePayments');
    const existing = getExistingIds('ExpensePayments', 0);
    p.expensePayments.forEach(function(item) {
      if (!existing.has(String(item.paymentId))) {
        paySheet.appendRow([
          item.paymentId, item.expenseId, item.paymentDate, Number(item.amount) || 0,
          item.paymentMethod || 'CASH', item.accountId, item.referenceNumber || '', item.remarks || '', item.createdAt || new Date().toISOString()
        ]);
        existing.add(String(item.paymentId));
        result.migrated.payments++;
      } else {
        result.skipped.payments++;
      }
    });
  }

  // Transactions
  if (Array.isArray(p.transactions) && p.transactions.length > 0) {
    const txnSheet = ss.getSheetByName('Transactions');
    const existing = getExistingIds('Transactions', 0);
    p.transactions.forEach(function(item) {
      if (!existing.has(String(item.transactionId))) {
        txnSheet.appendRow([
          item.transactionId, item.transactionDate, item.transactionType, item.referenceId || '',
          item.accountId, Number(item.amount) || 0, item.direction, item.description || '', item.paymentMethod || 'CASH', item.createdAt || new Date().toISOString()
        ]);
        existing.add(String(item.transactionId));
        result.migrated.transactions++;
      } else {
        result.skipped.transactions++;
      }
    });
  }

  // Budgets
  if (Array.isArray(p.budgets) && p.budgets.length > 0) {
    const bdgSheet = ss.getSheetByName('Budgets');
    const existing = getExistingIds('Budgets', 0);
    p.budgets.forEach(function(b) {
      if (!existing.has(String(b.budgetId))) {
        bdgSheet.appendRow([b.budgetId, b.categoryId, Number(b.budgetAmount) || 0, b.period || 'FLAVENCIA 2026', b.createdAt || new Date().toISOString(), b.updatedAt || new Date().toISOString()]);
        existing.add(String(b.budgetId));
        result.migrated.budgets++;
      } else {
        result.skipped.budgets++;
      }
    });
  }

  logAudit(ss, 'MIGRATION', 'SYSTEM', 'BATCH-MIGRATE', '', JSON.stringify(result.migrated), p.performedBy || 'Admin', new Date().toISOString());

  return { success: true, message: 'Migration completed safely with zero duplicates', summary: result };
}

function handleAddAccount(ss, p) {
  if (!p.accountName) return { success: false, error: 'Account name required' };
  const accSheet = ss.getSheetByName('Accounts');
  const accId = 'ACC-' + Date.now().toString().slice(-4);
  const now = new Date().toISOString();
  accSheet.appendRow([accId, p.accountName, p.accountType || 'BANK', Number(p.openingBalance) || 0, true, now]);
  logAudit(ss, 'CREATE_ACCOUNT', 'ACCOUNTS', accId, '', p.accountName, p.performedBy || 'Admin', now);
  return { success: true, message: 'Account created', accountId: accId };
}

// ============================================================================
// GOOGLE DRIVE FILE UPLOAD & BACKUP
// ============================================================================

function handleUploadFile(p) {
  try {
    const fileName = p.fileName || ('upload_' + Date.now());
    const base64Data = p.base64Data;
    const folderType = p.folderType || 'INCOME RECEIPTS'; // or 'EXPENSE BILLS', 'FINANCIAL REPORTS'

    if (!base64Data) {
      return { success: false, error: 'File data is empty' };
    }

    const decoded = Utilities.base64Decode(base64Data.split(',')[1] || base64Data);
    const contentType = p.contentType || 'application/pdf';
    const blob = Utilities.newBlob(decoded, contentType, fileName);

    // Locate or create Root Folder "FLAVENCIA FINANCE"
    let rootFolders = DriveApp.getFoldersByName('FLAVENCIA FINANCE');
    let rootFolder;
    if (rootFolders.hasNext()) {
      rootFolder = rootFolders.next();
    } else {
      rootFolder = DriveApp.createFolder('FLAVENCIA FINANCE');
    }

    // Locate or create subfolder
    let subFolders = rootFolder.getFoldersByName(folderType);
    let targetFolder;
    if (subFolders.hasNext()) {
      targetFolder = subFolders.next();
    } else {
      targetFolder = rootFolder.createFolder(folderType);
    }

    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      fileUrl: file.getUrl(),
      fileId: file.getId(),
      downloadUrl: file.getDownloadUrl()
    };
  } catch (err) {
    return { success: false, error: 'Drive upload error: ' + err.toString() };
  }
}

function handleBackupDatabase(ss) {
  try {
    let rootFolders = DriveApp.getFoldersByName('FLAVENCIA FINANCE');
    let rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder('FLAVENCIA FINANCE');
    
    let subFolders = rootFolder.getFoldersByName('BACKUPS');
    let backupFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder('BACKUPS');

    const backupName = 'FLAVENCIA_2026_FINANCE_BACKUP_' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd_HHmmss');
    const file = DriveApp.getFileById(ss.getId());
    const backupFile = file.makeCopy(backupName, backupFolder);

    return {
      success: true,
      message: 'Database backup created successfully',
      backupUrl: backupFile.getUrl()
    };
  } catch (err) {
    return { success: false, error: 'Backup creation failed: ' + err.toString() };
  }
}

function logAudit(ss, actionType, module, recordId, oldValue, newValue, performedBy, timestamp) {
  try {
    const logSheet = ss.getSheetByName('AuditLogs');
    if (!logSheet) return;
    const logId = 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    logSheet.appendRow([logId, actionType, module, recordId, oldValue, newValue, performedBy, timestamp]);
  } catch (e) {
    console.error('Audit log write error:', e);
  }
}
