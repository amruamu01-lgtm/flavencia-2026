// FLAVENCIA 2026 - PDF Generation Engine using Dynamic jsPDF & autoTable

import {
  FinalSettlementData,
  IncomeRecord,
  ExpenseRecord,
  TransactionRecord
} from '../types/financial';
import { formatCurrency, formatDate } from '../utils/formatters';

// Clean Minimal Color Palette for PDFs
const COLOR_PRIMARY = [30, 58, 95]; // #1E3A5F Navy Blue
const COLOR_NAVY_ACCENT = [45, 85, 135]; // Lighter Navy Accent
const COLOR_INCOME = [22, 163, 74]; // #16A34A Green
const COLOR_EXPENSE = [220, 38, 38]; // #DC2626 Red
const COLOR_SLATE = [55, 65, 81]; // #374151 Dark Grey
const COLOR_BG_LIGHT = [243, 244, 246]; // #F3F4F6 Light Grey

async function getPdfEngine() {
  const [jsPdfModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const jsPDF = jsPdfModule.default;
  const autoTable = autoTableModule.default;
  return { jsPDF, autoTable };
}

/**
 * Generate Festival Final Settlement PDF Report
 */
export async function generateFinalSettlementPdf(data: FinalSettlementData): Promise<void> {
  const { jsPDF, autoTable } = await getPdfEngine();
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 1. Header Banner
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');
  
  // Navy Accent Strip
  doc.setFillColor(COLOR_NAVY_ACCENT[0], COLOR_NAVY_ACCENT[1], COLOR_NAVY_ACCENT[2]);
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Title & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('FLAVENCIA 2026', 14, 18);
  
  doc.setTextColor(COLOR_NAVY_ACCENT[0], COLOR_NAVY_ACCENT[1], COLOR_NAVY_ACCENT[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BEYOND BOUNDARIES', 14, 25);

  doc.setTextColor(200, 200, 210);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('FINANCE & ACCOUNTS MANAGEMENT SYSTEM – FINAL SETTLEMENT', 14, 32);

  // Date & Prepared Metadata (Top Right)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Report Date: ${data.preparedDate || formatDate(new Date().toISOString().split('T')[0])}`, pageWidth - 14, 18, { align: 'right' });
  doc.text('Status: OFFICIAL AUDITED SETTLEMENT', pageWidth - 14, 25, { align: 'right' });
  doc.text('Currency: INR (₹)', pageWidth - 14, 32, { align: 'right' });

  let currentY = 52;

  // 2. Executive Financial Summary Cards
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. Executive Financial Summary', 14, currentY);
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    body: [
      ['Grand Total Income Received', formatCurrency(data.grandTotalIncome, true), 'Gross receipts from all festival sources'],
      ['Grand Total Paid Expenses', formatCurrency(data.grandTotalPaidExpenses, true), 'Actual disbursements made to vendors & operations'],
      ['Net Available Balance', formatCurrency(data.netAvailableBalance, true), 'Surplus balance in active bank/cash accounts'],
      ['Total Outstanding Liabilities', formatCurrency(data.totalOutstandingAmount, true), 'Pending balance to be cleared for partial/unpaid bills'],
    ],
    head: [['Metric', 'Amount (INR)', 'Financial Notes']],
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { fontStyle: 'bold', textColor: [20, 83, 45], cellWidth: 45 },
      2: { textColor: COLOR_SLATE as [number, number, number] }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // 3. Accounts & Liquid Reserves Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('2. Closing Cash & Bank Balances', 14, currentY);
  currentY += 6;

  const accountsRows = data.accountsBreakdown.map(acc => [
    acc.accountName,
    formatCurrency(acc.balance, true),
    acc.balance >= 0 ? 'Surplus / Active' : 'Overdraft'
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: 'striped',
    headStyles: {
      fillColor: [40, 45, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    head: [['Account Name', 'Closing Balance', 'Status']],
    body: [
      ...accountsRows,
      ['Total Liquid Funds Across All Accounts', formatCurrency(data.netAvailableBalance, true), 'Verified Match']
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { fontStyle: 'bold', cellWidth: 50 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Check page overflow
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // 4. Category-Wise Financial Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('3. Category-Wise Income Breakdown', 14, currentY);
  currentY += 6;

  const incomeRows = data.incomeByCategory.map(item => [
    item.categoryName,
    formatCurrency(item.amount, true),
    data.grandTotalIncome > 0 ? `${((item.amount / data.grandTotalIncome) * 100).toFixed(1)}%` : '0%'
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
    head: [['Income Category', 'Amount Collected', '% of Total Income']],
    body: incomeRows.length > 0 ? incomeRows : [['No income records found', '₹0.00', '0%']],
    styles: { fontSize: 8, cellPadding: 2.8 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Category-Wise Expense Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('4. Category-Wise Expense Breakdown (Paid)', 14, currentY);
  currentY += 6;

  const expenseRows = data.expensesByCategory.map(item => [
    item.categoryName,
    formatCurrency(item.amount, true),
    data.grandTotalPaidExpenses > 0 ? `${((item.amount / data.grandTotalPaidExpenses) * 100).toFixed(1)}%` : '0%'
  ]);

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    headStyles: { fillColor: [88, 28, 28], textColor: [255, 255, 255], fontSize: 8.5 },
    head: [['Expense Category', 'Actual Paid Amount', '% of Total Expenses']],
    body: expenseRows.length > 0 ? expenseRows : [['No expense records found', '₹0.00', '0%']],
    styles: { fontSize: 8, cellPadding: 2.8 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  if (currentY > 230) {
    doc.addPage();
    currentY = 30;
  }

  // 6. Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);

  doc.text('_________________________________', 25, currentY);
  doc.text('Finance Coordinator / Treasurer', 25, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('FLAVENCIA 2026 Core Committee', 25, currentY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('_________________________________', pageWidth - 75, currentY);
  doc.text('General Secretary / Chairperson', pageWidth - 75, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('FLAVENCIA 2026 Organizing Board', pageWidth - 75, currentY + 11);

  // Save the PDF
  doc.save(`FLAVENCIA_2026_Final_Settlement_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generate Income Records PDF Report
 */
export async function generateIncomeReportPdf(incomes: IncomeRecord[], title: string = 'Income Report'): Promise<void> {
  const { jsPDF, autoTable } = await getPdfEngine();
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(COLOR_NAVY_ACCENT[0], COLOR_NAVY_ACCENT[1], COLOR_NAVY_ACCENT[2]);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FLAVENCIA 2026', 14, 14);
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 242);
  doc.text(title.toUpperCase(), 14, 22);

  const total = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Total Records: ${incomes.length}  |  Total Amount: ${formatCurrency(total, true)}`, pageWidth - 14, 18, { align: 'right' });

  const rows = incomes.map(inc => [
    inc.incomeId,
    formatDate(inc.date),
    inc.sourceName,
    inc.description || '-',
    inc.paymentMethod,
    formatCurrency(inc.amount, true),
    inc.receivedBy || 'Admin'
  ]);

  autoTable(doc, {
    startY: 36,
    theme: 'grid',
    headStyles: { fillColor: COLOR_PRIMARY as [number, number, number], fontSize: 8.5 },
    head: [['Income ID', 'Date', 'Source / Received From', 'Description', 'Method', 'Amount', 'Received By']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      5: { fontStyle: 'bold', halign: 'right' }
    }
  });

  doc.save(`FLAVENCIA_2026_Income_Report_${Date.now()}.pdf`);
}

/**
 * Generate Expense Records PDF Report
 */
export async function generateExpenseReportPdf(expenses: ExpenseRecord[], title: string = 'Expense Report'): Promise<void> {
  const { jsPDF, autoTable } = await getPdfEngine();
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(COLOR_NAVY_ACCENT[0], COLOR_NAVY_ACCENT[1], COLOR_NAVY_ACCENT[2]);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FLAVENCIA 2026', 14, 14);
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 242);
  doc.text(title.toUpperCase(), 14, 22);

  const totalBill = expenses.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
  const totalPaid = expenses.reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);
  const totalBalance = expenses.reduce((s, e) => s + (Number(e.balanceAmount) || 0), 0);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(`Total Bills: ${formatCurrency(totalBill)}  |  Total Paid: ${formatCurrency(totalPaid)}  |  Outstanding: ${formatCurrency(totalBalance)}`, pageWidth - 14, 18, { align: 'right' });

  const rows = expenses.map(e => [
    e.expenseId,
    formatDate(e.date),
    e.itemName,
    e.vendorName,
    e.paymentStatus,
    formatCurrency(e.totalAmount, true),
    formatCurrency(e.paidAmount, true),
    formatCurrency(e.balanceAmount, true),
    e.paidBy || 'Admin'
  ]);

  autoTable(doc, {
    startY: 36,
    theme: 'grid',
    headStyles: { fillColor: COLOR_PRIMARY as [number, number, number], fontSize: 8.5 },
    head: [['Expense ID', 'Date', 'Item / Purpose', 'Vendor', 'Status', 'Total Amount', 'Paid Amount', 'Balance', 'Paid By']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      5: { halign: 'right' },
      6: { fontStyle: 'bold', halign: 'right' },
      7: { fontStyle: 'bold', halign: 'right' }
    }
  });

  doc.save(`FLAVENCIA_2026_Expense_Report_${Date.now()}.pdf`);
}

/**
 * Generate Unified Transactions Ledger PDF
 */
export async function generateTransactionLedgerPdf(transactions: TransactionRecord[], title: string = 'Financial Transaction Ledger'): Promise<void> {
  const { jsPDF, autoTable } = await getPdfEngine();
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(COLOR_NAVY_ACCENT[0], COLOR_NAVY_ACCENT[1], COLOR_NAVY_ACCENT[2]);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FLAVENCIA 2026', 14, 14);
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 242);
  doc.text(title.toUpperCase(), 14, 22);

  const rows = transactions.map(t => [
    t.transactionId,
    formatDate(t.transactionDate),
    t.transactionType,
    t.referenceId || '-',
    t.description,
    t.paymentMethod,
    t.direction === 'CREDIT' ? formatCurrency(t.amount, true) : '-',
    t.direction === 'DEBIT' ? formatCurrency(t.amount, true) : '-',
    t.runningBalance !== undefined ? formatCurrency(t.runningBalance, true) : '-'
  ]);

  autoTable(doc, {
    startY: 36,
    theme: 'striped',
    headStyles: { fillColor: COLOR_PRIMARY as [number, number, number], fontSize: 8 },
    head: [['Txn ID', 'Date', 'Type', 'Ref ID', 'Description', 'Method', 'Credit (₹)', 'Debit (₹)', 'Running Bal']],
    body: rows,
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      6: { halign: 'right', textColor: [22, 101, 52] },
      7: { halign: 'right', textColor: [153, 27, 27] },
      8: { halign: 'right', fontStyle: 'bold' }
    }
  });

  doc.save(`FLAVENCIA_2026_Transactions_Ledger_${Date.now()}.pdf`);
}
