# FLAVENCIA 2026 – FINANCE & ACCOUNTS MANAGEMENT SYSTEM
**Tagline: BEYOND BOUNDARIES**

A complete, production-ready financial and accounting management web application engineered for the **FLAVENCIA 2026** festival.

---

## 🌟 Key Architectural Highlights

- **Single Admin Authorization**: Secure single-admin login portal with SHA-256 password hashing, session expiration timer, and protected routes.
- **Google Sheets as Master Database**: Direct cloud persistence with 10 structured tabs (`Settings`, `Income`, `Expenses`, `ExpensePayments`, `Transactions`, `Categories`, `Accounts`, `Transfers`, `Budgets`, `AuditLogs`).
- **Google Apps Script Backend**: Action-based API router with `LockService` concurrency control, batch spreadsheet I/O, server-side validation, and automated Drive folder structure.
- **Zero Approval Delay**: Direct entry workflow for income and expense transactions. Completely excludes approval queues or pending statuses.
- **Partial & Multi-Payment Protocol**: Support multiple partial disbursements against a single vendor invoice (e.g. ₹4,000 + ₹3,000 + ₹3,000 = ₹10,000). Only actual payments deduct account balances.
- **Inter-Account Transfers**: Move funds between Cash in Hand, Bank, and UPI without distorting income or expense statistics.
- **Audit-Grade Reporting & Final Settlement**: 14 distinct reports, Excel (.xlsx) export, PDF report generator with luxury FLAVENCIA branding, and certified Festival Final Settlement statement.
- **Premium UI/UX Design**: Deep Black, Charcoal, Antique Gold, and Champagne Gold styling, Indian Rupee (`₹`) formatting, Indian numbering, and DD/MM/YYYY date formatting.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Google Apps Script (REST Web App with `doGet` / `doPost` & `LockService`) |
| **Primary Database** | Google Sheets (Master Spreadsheet with 10 synchronized sheets) |
| **File Storage** | Google Drive (`FLAVENCIA FINANCE/` -> Receipts, Bills, Reports, Backups) |
| **Report Generation** | `jspdf`, `jspdf-autotable`, `xlsx` (SheetJS) |
| **Hosting** | Vercel Ready (`vercel.json` included) |

---

## 📊 Database Schema (10 Master Sheets)

1. **`Settings`**: `[settingKey, settingValue, updatedAt]`
2. **`Income`**: `[incomeId, date, categoryId, sourceName, description, amount, paymentMethod, accountId, receivedBy, referenceNumber, receiptUrl, remarks, createdAt, updatedAt]`
3. **`Expenses`**: `[expenseId, date, categoryId, itemName, description, vendorName, totalAmount, paidAmount, balanceAmount, paymentMethod, accountId, paidBy, billUrl, paymentStatus, remarks, createdAt, updatedAt]`
4. **`ExpensePayments`**: `[paymentId, expenseId, paymentDate, amount, paymentMethod, accountId, referenceNumber, remarks, createdAt]`
5. **`Transactions`**: `[transactionId, transactionDate, transactionType, referenceId, accountId, amount, direction, description, paymentMethod, createdAt]`
6. **`Categories`**: `[categoryId, categoryName, categoryType, description, isActive, createdAt]`
7. **`Accounts`**: `[accountId, accountName, accountType, openingBalance, isActive, createdAt]`
8. **`Transfers`**: `[transferId, transferDate, fromAccountId, toAccountId, amount, referenceNumber, description, createdAt]`
9. **`Budgets`**: `[budgetId, categoryId, budgetAmount, period, createdAt, updatedAt]`
10. **`AuditLogs`**: `[logId, actionType, module, recordId, oldValue, newValue, performedBy, timestamp]`

---

## 🚀 Quick Start & Development

### 1. Installation & Running Locally
```bash
cd "C:\Users\misabpv\.gemini\antigravity\scratch\flavencia-2026"
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Default Admin Credentials
- **Username**: `admin`
- **Default Password**: `flavencia2026` *(or `admin123`)*

---

## ☁️ Google Sheets & Apps Script Setup

See the complete step-by-step guide in [`google-apps-script/DEPLOYMENT_INSTRUCTIONS.md`](google-apps-script/DEPLOYMENT_INSTRUCTIONS.md):

1. Create a blank Google Sheet titled `FLAVENCIA 2026 – Master Finance Database`.
2. Open **Extensions** > **Apps Script**, paste [`google-apps-script/Code.gs`](google-apps-script/Code.gs) and [`google-apps-script/Setup.gs`](google-apps-script/Setup.gs).
3. Run `setupFlavenciaSystem()` to auto-generate the 10 sheets and Google Drive directories.
4. Deploy as **Web App** (Execute as: **Me**, Who has access: **Anyone**).
5. Paste the Web App URL into the application **Settings** > **Google Apps Script Web App URL** and click **Save & Test Connection**.

---

## 🧪 Verification & Automated Testing

All 12 mandatory financial test cases pass with 100% precision:
```bash
node test_financial_engine.js
```
- ✅ **TEST 1**: Add ₹50,000 income -> Cash in Hand increases by ₹50,000.
- ✅ **TEST 2**: Add ₹10,000 expense with ₹0 paid -> Account balance unchanged; Status: UNPAID.
- ✅ **TEST 3**: Record ₹4,000 payment -> Account balance decreases by ₹4,000; Balance: ₹6,000; Status: PARTIALLY PAID.
- ✅ **TEST 4**: Record ₹3,000 payment -> Balance remaining: ₹3,000; Total paid: ₹7,000.
- ✅ **TEST 5**: Record final ₹3,000 payment -> Status flips to PAID; Balance remaining: ₹0.
- ✅ **TEST 6**: Transfer ₹10,000 from Cash to Bank -> Cash decreases to ₹30,000; Bank increases to ₹10,000.
- ✅ **TEST 7**: Account transfers are NOT counted as income or expenses. Available Liquid Funds = ₹40,000.
- ✅ **TEST 8**: Daily, monthly, and category-wise report structures computed accurately.
- ✅ **TEST 9**: Festival Final Settlement reconciles 100% with liquid reserves.
- ✅ **TEST 10**: Serialization and reload persistence verified.
- ✅ **TEST 11**: Over-payment protection & duplicate prevention active.
- ✅ **TEST 12**: Complete audit log history logged for all mutations.
