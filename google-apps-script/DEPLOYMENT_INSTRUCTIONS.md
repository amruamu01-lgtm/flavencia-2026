# FLAVENCIA 2026 – GOOGLE APPS SCRIPT & GOOGLE SHEETS SETUP GUIDE
**Tagline: BEYOND BOUNDARIES**

Follow these 4 simple steps to connect your FLAVENCIA 2026 React Web App to your live Google Sheets master database and Google Drive.

---

### STEP 1: Create Your Google Spreadsheet

1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Title it: `FLAVENCIA 2026 – Master Finance Database`
3. Copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`[YOUR_SPREADSHEET_ID]`**`/edit`

---

### STEP 2: Open Apps Script & Add Files

1. In your Google Spreadsheet menu, click **Extensions** > **Apps Script**.
2. Replace the default `Code.gs` with the code from [`google-apps-script/Code.gs`](file:///google-apps-script/Code.gs).
3. Click the **+** button next to Files, choose **Script**, name it `Setup`, and paste the code from [`google-apps-script/Setup.gs`](file:///google-apps-script/Setup.gs).
4. In Project Settings (gear icon), enable "Show 'appsscript.json' manifest file in editor", then paste [`google-apps-script/appsscript.json`](file:///google-apps-script/appsscript.json).

---

### STEP 3: Run Database Initialization

1. In the Apps Script toolbar, select the function dropdown and choose **`setupFlavenciaSystem`**.
2. Click **Run**.
3. Google will ask for authorization (Grant permissions to Sheets & Drive).
4. Check the Execution log:
   - All 10 required sheets (`Settings`, `Income`, `Expenses`, `ExpensePayments`, `Transactions`, `Categories`, `Accounts`, `Transfers`, `Budgets`, `AuditLogs`) will be created with headers and initial seeds.
   - Google Drive folder `FLAVENCIA FINANCE` with subfolders (`INCOME RECEIPTS`, `EXPENSE BILLS`, `FINANCIAL REPORTS`, `BACKUPS`) will be created.

---

### STEP 4: Deploy as Web App

1. Click **Deploy** > **New deployment** (blue button on top right).
2. Select type: **Web app**.
3. Description: `FLAVENCIA 2026 Finance Backend v1.0`.
4. **Execute as**: `Me (your Google email)`.
5. **Who has access**: `Anyone` (Crucial for frontend communication).
6. Click **Deploy**.
7. Copy the generated **Web App URL** (ends in `/exec`).

---

### STEP 5: Centralized Multi-Device Connectivity

1. In your Vercel deployment dashboard (or in `.env` file locally):
   - Set the environment variable:
     ```bash
     VITE_GAS_URL="https://script.google.com/macros/s/[YOUR_DEPLOYMENT_ID]/exec"
     ```
2. **Zero Manual Spreadsheet Configuration Required**:
   - The Master Google Spreadsheet is connected centrally on the backend.
   - The Admin and all connected devices (phones, laptops, tablets) automatically connect directly to the central database.
   - The Admin panel features a real-time **Database Connection Status** indicator and manual **Sync** button without requiring any manual Spreadsheet ID input.
