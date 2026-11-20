// Unique ID Generators for FLAVENCIA 2026

function randomAlphanumeric(length: number = 4): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateIncomeId(): string {
  const timestamp = Date.now().toString().slice(-4);
  return `INC-2026-${timestamp}${randomAlphanumeric(2)}`;
}

export function generateExpenseId(): string {
  const timestamp = Date.now().toString().slice(-4);
  return `EXP-2026-${timestamp}${randomAlphanumeric(2)}`;
}

export function generatePaymentId(): string {
  const timestamp = Date.now().toString().slice(-4);
  return `PAY-2026-${timestamp}${randomAlphanumeric(2)}`;
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString().slice(-4);
  return `TXN-2026-${timestamp}${randomAlphanumeric(2)}`;
}

export function generateTransferId(): string {
  const timestamp = Date.now().toString().slice(-4);
  return `TRF-2026-${timestamp}${randomAlphanumeric(2)}`;
}

export function generateCategoryId(): string {
  return `CAT-${Date.now().toString().slice(-4)}${randomAlphanumeric(2)}`;
}

export function generateAccountId(): string {
  return `ACC-${Date.now().toString().slice(-4)}${randomAlphanumeric(2)}`;
}

export function generateBudgetId(): string {
  return `BDG-2026-${Date.now().toString().slice(-4)}${randomAlphanumeric(2)}`;
}

export function generateLogId(): string {
  return `LOG-${Date.now()}-${randomAlphanumeric(3)}`;
}
